import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notionClient } from "./index";
import {
    NOTION_PERSONAL_DATABASE_ID,
    NOTION_WORKLOG_DATABASE_ID
} from "../../environments";
import { convertNotionResponseToTask, NotionTask } from "./types/common";
import { PersonalTaskStatus } from "./types/personal_database";
import { WorklogTaskStatus } from "./types/worklog_database";

export async function updateTasksToAutomated(tasks: NotionTask[]) {
    await Promise.all(
        tasks.map(async (task) => {
            await notionClient.pages.update({
                page_id: task.id || "",
                properties: {
                    Automated: {
                        checkbox: true
                    }
                }
            });
        })
    );
}
export async function getPersonalTasksByDueDate(
    dueDate: Date,
    filterAutomated: boolean = true
): Promise<NotionTask[]> {
    const date = dueDate.toISOString().split("T")[0];
    const filters: any[] = [
        {
            property: "due",
            date: {
                equals: date
            }
        },
        {
            property: "Status",
            status: {
                does_not_equal: PersonalTaskStatus.DONE
            }
        }
    ];
    if (filterAutomated) {
        filters.push({
            property: "Automated",
            checkbox: {
                equals: false
            }
        });
    }
    const response = await notionClient.databases.query({
        database_id: NOTION_PERSONAL_DATABASE_ID,
        filter: {
            and: filters
        }
    });
    return response.results.map((result) => {
        return convertNotionResponseToTask(
            result as DatabaseObjectResponse,
            true
        );
    });
}

export async function getWorkLogNotionTasks(): Promise<NotionTask[]> {
    const filters: any[] = [];
    const statuses = [
        WorklogTaskStatus.DONE,
        WorklogTaskStatus.IN_PROGRESS,
        WorklogTaskStatus.NOT_STARTED,
        WorklogTaskStatus.BLOCKED
    ];
    statuses.forEach(async (status) => {
        filters.push({
            property: "Status",
            status: {
                equals: status
            }
        });
    });
    const oneMonthAgo = new Date(new Date().setDate(new Date().getDate() - 30))
        .toISOString()
        .split("T")[0];
    const response = await notionClient.databases.query({
        database_id: NOTION_WORKLOG_DATABASE_ID,
        filter: {
            and: [
                {
                    or: [
                        {
                            property: "Date",
                            date: {
                                after: oneMonthAgo
                            }
                        },
                        {
                            property: "Date",
                            date: {
                                is_empty: true
                            }
                        }
                    ]
                },
                {
                    or: filters
                }
            ]
        }
    });
    return response.results.map((result) => {
        return convertNotionResponseToTask(
            result as DatabaseObjectResponse,
            false
        );
    });
}
