import { NOTION_WORKLOG_DATABASE_ID } from "../environments";

import { getMyTasksFromClickUp } from "../clients/clickup/functions";
import { NotionTask, TaskStatus, TaskType } from "../clients/notion/types";
import { getNotionTasks } from "../clients/notion/functions";
import { ClickUpStatus, ClickUpTask } from "../clients/clickup/types";
import { notionClient } from "../clients/notion";
import { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";

const INTEGRATION_LOG_PREFIX = "[ClickUp to Notion]";

export async function clickupToNotion() {
    const clickupTasks: ClickUpTask[] = await getMyTasksFromClickUp();
    const notionTasks: NotionTask[] = await getNotionTasks(
        NOTION_WORKLOG_DATABASE_ID
    );
    console.log(
        `${INTEGRATION_LOG_PREFIX} Got ${notionTasks.length} tasks from Notion`
    );
    console.log(
        `${INTEGRATION_LOG_PREFIX} Got ${clickupTasks.length} tasks from ClickUp`
    );
    const notAutomatedTasks: ClickUpTask[] = findNotAutomatedTasks(
        clickupTasks,
        notionTasks
    );
    console.log(
        `${INTEGRATION_LOG_PREFIX} Not automated tasks: ${notAutomatedTasks.length} out of ${clickupTasks.length}`
    );
    const newNotionTasks: NotionTask[] = notAutomatedTasks.map((task) => {
        return convertClickUpToNotionTask(task);
    });
    console.log(
        `${INTEGRATION_LOG_PREFIX} Creating ${newNotionTasks.length} new tasks in Notion`
    );
    await Promise.all(
        newNotionTasks.map((task) => {
            createNotionTask(task);
        })
    );
    const stillAssignedTasks: NotionTask[] =
        findStillAssignedTasksButDoneInNotion(clickupTasks, notionTasks);
    console.log(
        `${INTEGRATION_LOG_PREFIX} Updating ${stillAssignedTasks.length} tasks to not started in Notion`
    );
    await Promise.all(
        stillAssignedTasks.map((task) => {
            updateTasksToNotStarted(task);
        })
    );
    console.log(`${INTEGRATION_LOG_PREFIX} Done`);
}

async function updateTasksToNotStarted(notionTask: NotionTask): Promise<void> {
    if (!notionTask.id) {
        return;
    }
    await notionClient.pages.update({
        page_id: notionTask.id,
        properties: {
            Status: {
                status: {
                    name: TaskStatus.NOT_STARTED
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
): NotionTask[] {
    return notionTasks.filter((task) => {
        return clickupTasks.find(
            (clickupTask) =>
                task.properties.link === clickupTask.url &&
                task.properties.status === TaskStatus.DONE
        );
    });
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
