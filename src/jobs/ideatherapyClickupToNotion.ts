import {
    IDEATHERAPY_CLICKUP_API_KEY,
    IDEATHERAPY_CLICKUP_LIST_ID,
    IDEATHERAPY_CLICKUP_USER_ID,
    NOTION_PERSONAL_DATABASE_ID
} from "../environments";

import { getMyTasksFromClickUp } from "../clients/clickup/functions";
import { isWorklogNotionProperties, NotionTask } from "../clients/notion/types";
import { ClickUpTask } from "../clients/clickup/types";
import { notionClient } from "../clients/notion";
import { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import { log } from "../clients/logger";
import { getAutomatedPersonalTasks } from "../clients/notion/personal_dashboard/functions";
import {
    PersonalNotionProperties,
    PersonalTaskStatus
} from "../clients/notion/personal_dashboard/types";
import { IdeatherapyClickUpStatus } from "../clients/clickup/ideatherapy/types";

const IDEATHERAPY_PROJECT_ID = "13ca06ee07ab806896e2da5b4c6935a6";
export const LOG_NAME = "Ideatherapy ClickUp to Notion";

export async function ideatherapyClickupToNotion(
    manualTrigger: boolean = false
) {
    const clickupTasks: ClickUpTask[] = await getMyTasksFromClickUp(
        IDEATHERAPY_CLICKUP_LIST_ID,
        IDEATHERAPY_CLICKUP_USER_ID,
        IDEATHERAPY_CLICKUP_API_KEY
    );

    const automatedNotionTasks: NotionTask[] =
        await getAutomatedPersonalTasks();

    const newClickupTasks: ClickUpTask[] = await findNewClickupTasks(
        clickupTasks,
        automatedNotionTasks
    );

    const newNotionTasks: NotionTask[] = newClickupTasks.map((task) => {
        return convertClickUpToPersonalNotionTask(task);
    });

    await createNotionTasks(newNotionTasks);

    if (manualTrigger && newNotionTasks.length === 0) {
        await log(`No new tasks created in Notion`, LOG_NAME, "success", true);
    }
}

async function createNotionTasks(tasks: NotionTask[]): Promise<void> {
    await Promise.all(
        tasks.map(async (task) => {
            if (isWorklogNotionProperties(task.properties)) {
                return;
            }
            const today = new Date().toISOString().split("T")[0];
            const newPage: CreatePageParameters = {
                parent: {
                    database_id: NOTION_PERSONAL_DATABASE_ID
                },
                properties: {
                    "Task name": {
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
                    URL: {
                        url: task.properties.url
                    },
                    Automated: {
                        checkbox: task.properties.automated
                    },
                    "Week task": {
                        checkbox: task.properties.weekTask
                    },
                    Project: {
                        relation: [
                            {
                                id: IDEATHERAPY_PROJECT_ID
                            }
                        ]
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

async function findNewClickupTasks(
    clickupTasks: ClickUpTask[],
    notionTasks: NotionTask[]
): Promise<ClickUpTask[]> {
    const tasks = clickupTasks.filter((task) => {
        return !notionTasks.some(
            (notionTask) =>
                (notionTask.properties as PersonalNotionProperties).url ===
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

function convertClickUpToPersonalNotionTask(task: ClickUpTask): NotionTask {
    return {
        id: "new",
        createdTime: new Date(),
        content: "", //task.description,
        properties: {
            dashboard: "Personal",
            projectName: "Ideatherapy",
            name: task.name,
            status: convertIdeatherapyClickUpStatusToTaskStatus(
                task.status as IdeatherapyClickUpStatus
            ),
            url: task.url,
            automated: true,
            weekTask: true
        }
    };
}

function convertIdeatherapyClickUpStatusToTaskStatus(
    status: IdeatherapyClickUpStatus
): PersonalTaskStatus {
    switch (status.status.toUpperCase()) {
        case "TO DO":
            return PersonalTaskStatus.NOT_STARTED;
        case "FEASABLITY":
            return PersonalTaskStatus.NOT_STARTED;
        case "COMPLETE":
            return PersonalTaskStatus.DONE;
    }
    throw new Error(`Unknown status: ${status.status}`);
}
