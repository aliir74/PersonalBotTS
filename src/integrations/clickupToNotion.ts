import {
    MY_TELEGRAM_USER_ID,
    NOTION_WORKLOG_DATABASE_ID
} from "../environments";

import { getMyTasksFromClickUp } from "../clients/clickup/functions";
import { NotionTask, TaskStatus, TaskType } from "../clients/notion/types";
import { getNotionTasks } from "../clients/notion/functions";
import { ClickUpStatus, ClickUpTask } from "../clients/clickup/types";
import { notionClient } from "../clients/notion";
import { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import { log } from "../clients/logger";
const INTEGRATION_LOG_PREFIX = "[ClickUp to Notion]";

// TODO: Some tasks are not being updated in Notion
export async function clickupToNotion(manualTrigger: boolean = false) {
    const clickupTasks: ClickUpTask[] = await getMyTasksFromClickUp();
    const notionTasks: NotionTask[] = await getNotionTasks(
        NOTION_WORKLOG_DATABASE_ID
    );
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
    await Promise.all(
        newNotionTasks.map((task) => {
            createNotionTask(task);
        })
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

    const stillAssignedTasks: {
        notionTask: NotionTask;
        clickupTask: ClickUpTask;
    }[] = findStillAssignedTasksButDoneInNotion(clickupTasks, notionTasks);
    await log(
        `Updating ${stillAssignedTasks.length} tasks to not started in Notion`,
        "ClickUp to Notion",
        "success"
    );
    await Promise.all(
        stillAssignedTasks.map((task) => {
            updateNotionTasksFromClickUp(task);
        })
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
    await notionClient.pages.update({
        page_id: task.notionTask.id,
        properties: {
            Status: {
                status: {
                    name: TaskStatus.NOT_STARTED
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
    const newPage: CreatePageParameters = {
        parent: {
            database_id: NOTION_WORKLOG_DATABASE_ID
        },
        properties: {
            Name: {
                title: [
                    {
                        text: { content: task.properties.taskName }
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
            Type: {
                status: {
                    name: task.properties.type ?? TaskType.DEVELOPMENT
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
        .filter((task) => task.properties.status === TaskStatus.DONE)
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
            taskName: task.name,
            status: TaskStatus.NOT_STARTED,
            link: task.url,
            automated: true,
            type: convertClickUpStatusToTaskType(task.status)
        }
    };
}

function convertClickUpStatusToTaskType(status: ClickUpStatus): TaskType {
    switch (status.status) {
        case "ready for analysis":
            return TaskType.ANALYSIS;
        case "in analysis":
            return TaskType.ANALYSIS;
        case "ready for development":
            return TaskType.DEVELOPMENT;
        case "in development":
            return TaskType.DEVELOPMENT;
        case "review+":
            return TaskType.REVIEW;
        case "verification+":
            return TaskType.VERIFY;
        case "ready to deploy":
            return TaskType.DEPLOY;
        case "deployed":
            return TaskType.DEPLOY;
        default:
            return TaskType.DEVELOPMENT;
    }
}
