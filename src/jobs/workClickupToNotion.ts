import {
    NOTION_WORKLOG_DATABASE_ID,
    WORK_CLICKUP_API_KEY,
    WORK_CLICKUP_LIST_ID,
    WORK_CLICKUP_USER_ID
} from "../environments";

import { getMyTasksFromClickUp } from "../clients/clickup/functions";
import {
    isPersonalNotionProperties,
    NotionTask
} from "../clients/notion/types";
import {
    WorklogNotionProperties,
    WorklogTaskStatus
} from "../clients/notion/worklog_dashboard/types";
import { getWorkLogNotionTasks } from "../clients/notion/worklog_dashboard/functions";
import { ClickUpTask } from "../clients/clickup/types";
import { WorkClickUpStatus } from "../clients/clickup/work/types";
import { notionClient } from "../clients/notion";
import { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import { log } from "../clients/logger";
import { retryDecorator } from "ts-retry-promise";
import { DEFAULT_RETRY_CONFIG } from "../consts";
import { WorklogTaskType } from "../clients/notion/worklog_dashboard/types";

export const LOG_NAME = "Work ClickUp to Notion";

export async function workClickupToNotion(manualTrigger: boolean = false) {
    const clickupTasks: ClickUpTask[] = await retryDecorator(
        getMyTasksFromClickUp,
        DEFAULT_RETRY_CONFIG
    )(WORK_CLICKUP_LIST_ID, WORK_CLICKUP_USER_ID, WORK_CLICKUP_API_KEY);

    const notionTasks: NotionTask[] = await retryDecorator(
        getWorkLogNotionTasks,
        DEFAULT_RETRY_CONFIG
    )();

    const notAutomatedTasks: ClickUpTask[] = await findNotAutomatedTasks(
        clickupTasks,
        notionTasks
    );

    const newNotionTasks: NotionTask[] = notAutomatedTasks.map((task) => {
        return convertClickUpToNotionTask(task);
    });

    await retryDecorator(
        createNotionTasks,
        DEFAULT_RETRY_CONFIG
    )(newNotionTasks);

    if (manualTrigger && newNotionTasks.length === 0) {
        await log(`No new tasks created in Notion`, LOG_NAME, "success", true);
    }
    const stillAssignedTasks: {
        notionTask: NotionTask;
        clickupTask: ClickUpTask;
    }[] = findStillAssignedTasksButDoneInNotion(clickupTasks, notionTasks);
    await retryDecorator(
        updateNotionTasksFromClickUp,
        DEFAULT_RETRY_CONFIG
    )(stillAssignedTasks);
    if (manualTrigger && stillAssignedTasks.length === 0) {
        await log(
            `${stillAssignedTasks.length} tasks updated to not started in Notion`,
            LOG_NAME,
            "success",
            true
        );
    }
}

async function updateNotionTasksFromClickUp(
    tasks: {
        notionTask: NotionTask;
        clickupTask: ClickUpTask;
    }[]
): Promise<void> {
    await Promise.all(
        tasks.map(async (task) => {
            if (!task.notionTask.id) {
                return;
            }
            const newStatus = WorklogTaskStatus.NOT_STARTED;
            const newType = convertClickUpStatusToTaskType(
                task.clickupTask.status as WorkClickUpStatus
            );
            const today = new Date().toISOString().split("T")[0];
            await notionClient.comments.create({
                parent: {
                    page_id: task.notionTask.id
                },
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: `Brought back to ${newStatus} at ${new Date().toLocaleString()} for ${newType}`
                        }
                    }
                ]
            });
            await notionClient.pages.update({
                page_id: task.notionTask.id,
                properties: {
                    Status: {
                        status: {
                            name: newStatus
                        }
                    },
                    Type: {
                        status: {
                            name: newType
                        }
                    },
                    Date: {
                        date: {
                            start: today
                        }
                    }
                }
            });
        })
    );
    await log(
        `${tasks.length} tasks updated to not started in Notion`,
        LOG_NAME,
        "success"
    );
}

async function createNotionTasks(tasks: NotionTask[]): Promise<void> {
    await Promise.all(
        tasks.map(async (task) => {
            if (isPersonalNotionProperties(task.properties)) {
                return;
            }
            const today = new Date().toISOString().split("T")[0];
            const newPage: CreatePageParameters = {
                parent: {
                    database_id: NOTION_WORKLOG_DATABASE_ID
                },
                properties: {
                    Name: {
                        title: [
                            {
                                text: { content: task.properties.name }
                            }
                        ]
                    },
                    Status: {
                        status: {
                            name: task.properties.status
                        }
                    },
                    Link: {
                        url: task.properties.link ?? ""
                    },
                    Automated: {
                        checkbox: task.properties.automated
                    },
                    Priority: {
                        checkbox: task.properties.priority
                    },
                    Type: {
                        status: {
                            name: task.properties.type
                        }
                    },
                    Date: {
                        date: {
                            start: today
                        }
                    }
                },
                children: [
                    {
                        object: "block",
                        type: "paragraph",
                        paragraph: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: { content: task.content }
                                }
                            ]
                        }
                    }
                ]
            };
            const response = await notionClient.pages.create(newPage);
            await notionClient.comments.create({
                parent: {
                    page_id: response.id
                },
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: `Created from ClickUp at ${new Date().toLocaleString()}`
                        }
                    }
                ]
            });
        })
    );
    await log(
        `${tasks.length} new tasks created in Notion`,
        LOG_NAME,
        "success"
    );
}

async function findNotAutomatedTasks(
    clickupTasks: ClickUpTask[],
    notionTasks: NotionTask[]
): Promise<ClickUpTask[]> {
    const tasks = clickupTasks.filter((task) => {
        return !notionTasks.some(
            (notionTask) =>
                (notionTask.properties as WorklogNotionProperties).link ===
                task.url
        );
    });
    await log(
        `${tasks.length} not automated tasks out of ${clickupTasks.length}`,
        LOG_NAME,
        "success"
    );
    return tasks;
}

function findStillAssignedTasksButDoneInNotion(
    clickupTasks: ClickUpTask[],
    notionTasks: NotionTask[]
): { notionTask: NotionTask; clickupTask: ClickUpTask }[] {
    return notionTasks
        .filter((task) => task.properties.status === WorklogTaskStatus.DONE)
        .map((notionTask) => {
            const relatedClickupTask = clickupTasks.find(
                (clickupTask) =>
                    (notionTask.properties as WorklogNotionProperties).link ===
                    clickupTask.url
            );
            return relatedClickupTask
                ? { notionTask, clickupTask: relatedClickupTask }
                : null;
        })
        .filter(
            (
                result
            ): result is { notionTask: NotionTask; clickupTask: ClickUpTask } =>
                result !== null
        );
}

function convertClickUpToNotionTask(task: ClickUpTask): NotionTask {
    return {
        id: "new",
        createdTime: new Date(),
        content: "", //task.description,
        properties: {
            dashboard: "Worklog",
            name: task.name,
            status: WorklogTaskStatus.NOT_STARTED,
            link: task.url,
            automated: true,
            type: convertClickUpStatusToTaskType(
                task.status as WorkClickUpStatus
            ),
            priority: task.priority?.priority === "urgent",
            date: new Date().toISOString().split("T")[0]
        }
    };
}

function convertClickUpStatusToTaskType(
    status: WorkClickUpStatus
): WorklogTaskType {
    switch (status.status) {
        case "ready for analysis":
            return WorklogTaskType.ANALYSIS;
        case "in analysis":
            return WorklogTaskType.ANALYSIS;
        case "ready for development":
            return WorklogTaskType.DEVELOPMENT;
        case "in development":
            return WorklogTaskType.DEVELOPMENT;
        case "review+":
            return WorklogTaskType.REVIEW;
        case "verification+":
            return WorklogTaskType.VERIFY;
        case "ready to deploy":
            return WorklogTaskType.DEPLOY;
        case "deployed":
            return WorklogTaskType.DEPLOY;
        default:
            return WorklogTaskType.DEVELOPMENT;
    }
}
