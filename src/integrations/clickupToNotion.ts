import {
    MY_TELEGRAM_USER_ID,
    NOTION_WORKLOG_DATABASE_ID
} from "../environments";

import { getMyTasksFromClickUp } from "../clients/clickup/functions";
import {
    isPersonalNotionProperties,
    NotionTask
} from "../clients/notion/types";
import { WorklogTaskStatus } from "../clients/notion/worklog_dashboard/types";
import { getWorkLogNotionTasks } from "../clients/notion/worklog_dashboard/functions";
import { ClickUpStatus, ClickUpTask } from "../clients/clickup/types";
import { notionClient } from "../clients/notion";
import { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import { log } from "../clients/logger";
import { retryDecorator, retry } from "ts-retry-promise";
import { DEFAULT_RETRY_CONFIG } from "../consts";
import { WorklogTaskType } from "../clients/notion/worklog_dashboard/types";

export async function clickupToNotion(manualTrigger: boolean = false) {
    const clickupTasks: ClickUpTask[] = await retryDecorator(
        getMyTasksFromClickUp,
        DEFAULT_RETRY_CONFIG
    )();
    const notionTasks: NotionTask[] = await retryDecorator(
        getWorkLogNotionTasks,
        DEFAULT_RETRY_CONFIG
    )();
    await log(
        `${notionTasks.length} tasks from Notion`,
        "ClickUp to Notion",
        "success"
    );
    await log(
        `${clickupTasks.length} tasks from ClickUp`,
        "ClickUp to Notion",
        "success"
    );
    const notAutomatedTasks: ClickUpTask[] = findNotAutomatedTasks(
        clickupTasks,
        notionTasks
    );
    await log(
        `${notAutomatedTasks.length} not automated tasks out of ${clickupTasks.length}`,
        "ClickUp to Notion",
        "success"
    );
    const newNotionTasks: NotionTask[] = notAutomatedTasks.map((task) => {
        return convertClickUpToNotionTask(task);
    });
    await log(
        `Creating ${newNotionTasks.length} new tasks in Notion`,
        "ClickUp to Notion",
        "success"
    );
    await retry(
        () =>
            Promise.all(
                newNotionTasks.map(async (task) => {
                    await createNotionTask(task);
                })
            ),
        DEFAULT_RETRY_CONFIG
    );

    if (newNotionTasks.length !== 0) {
        await log(
            `${newNotionTasks.length} new tasks created in Notion`,
            "ClickUp to Notion",
            "success",
            true
        );
    } else if (manualTrigger) {
        await log(
            `No new tasks created in Notion`,
            "ClickUp to Notion",
            "success",
            true
        );
    }
    // console.log(clickupTasks);
    const stillAssignedTasks: {
        notionTask: NotionTask;
        clickupTask: ClickUpTask;
    }[] = findStillAssignedTasksButDoneInNotion(clickupTasks, notionTasks);
    await log(
        `Updating ${stillAssignedTasks.length} tasks to not started in Notion`,
        "ClickUp to Notion",
        "success"
    );
    await retry(
        () =>
            Promise.all(
                stillAssignedTasks.map(async (task) => {
                    await updateNotionTasksFromClickUp(task);
                })
            ),
        DEFAULT_RETRY_CONFIG
    );
    if (stillAssignedTasks.length !== 0) {
        await log(
            `${stillAssignedTasks.length} tasks updated to not started in Notion`,
            "ClickUp to Notion",
            "success",
            true
        );
    } else if (manualTrigger) {
        await log(
            `No tasks updated to not started in Notion`,
            "ClickUp to Notion",
            "success",
            true
        );
    }
}

async function updateNotionTasksFromClickUp(task: {
    notionTask: NotionTask;
    clickupTask: ClickUpTask;
}): Promise<void> {
    if (!task.notionTask.id) {
        return;
    }
    await notionClient.comments.create({
        parent: {
            page_id: task.notionTask.id
        },
        rich_text: [
            {
                type: "text",
                text: {
                    content: `Brought back to Not_Started at ${new Date().toLocaleString()}`
                }
            }
        ]
    });
    await notionClient.pages.update({
        page_id: task.notionTask.id,
        properties: {
            Status: {
                status: {
                    name: WorklogTaskStatus.NOT_STARTED
                }
            },
            Type: {
                status: {
                    name: convertClickUpStatusToTaskType(
                        task.clickupTask.status
                    )
                }
            }
        }
    });
}

async function createNotionTask(task: NotionTask): Promise<void> {
    if (isPersonalNotionProperties(task.properties)) {
        return;
    }
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
            }
        },
        children: [
            {
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [
                        { type: "text", text: { content: task.content } }
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
}

function findNotAutomatedTasks(
    clickupTasks: ClickUpTask[],
    notionTasks: NotionTask[]
): ClickUpTask[] {
    return clickupTasks.filter((task) => {
        return !notionTasks.some(
            (notionTask) => notionTask.properties.link === task.url
        );
    });
}

function findStillAssignedTasksButDoneInNotion(
    clickupTasks: ClickUpTask[],
    notionTasks: NotionTask[]
): { notionTask: NotionTask; clickupTask: ClickUpTask }[] {
    return notionTasks
        .filter((task) => task.properties.status === WorklogTaskStatus.DONE)
        .map((notionTask) => {
            const relatedClickupTask = clickupTasks.find(
                (clickupTask) => notionTask.properties.link === clickupTask.url
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
        createdTime: new Date(),
        content: task.description,
        properties: {
            dashboard: "Worklog",
            name: task.name,
            status: WorklogTaskStatus.NOT_STARTED,
            link: task.url,
            automated: true,
            type: convertClickUpStatusToTaskType(task.status),
            priority: task.priority?.priority === "urgent",
            date: new Date().toISOString().split("T")[0]
        }
    };
}

function convertClickUpStatusToTaskType(
    status: ClickUpStatus
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
