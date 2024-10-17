import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notionClient } from "./index";
import {
    NOTION_DATABASE_ID,
    NOTION_WORKLOG_DATABASE_ID
} from "../../environments";
import {
    convertToNotionTask,
    NotionTask,
    TaskStatus,
    DUE_DATE_PROPERTY
} from "./types";

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
export async function getTasksByDueDate(
    dueDate: Date,
    filterAutomated: boolean = true
): Promise<NotionTask[]> {
    const date = dueDate.toISOString().split("T")[0];
    const filters: any[] = [
        {
            property: DUE_DATE_PROPERTY,
            date: {
                equals: date
            }
        },
        {
            property: "Status",
            status: {
                does_not_equal: TaskStatus.DONE
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
        database_id: NOTION_DATABASE_ID,
        filter: {
            and: filters
        }
    });
    return response.results.map((result) => {
        return convertToNotionTask(result as DatabaseObjectResponse);
    });
}

export async function getNotionTasks(
    databaseId: string
): Promise<NotionTask[]> {
    const filters: any[] = [];
    const statuses = [
        TaskStatus.DONE,
        TaskStatus.IN_PROGRESS,
        TaskStatus.NOT_STARTED
    ];
    statuses.forEach(async (status) => {
        filters.push({
            property: "Status",
            status: {
                equals: status
            }
        });
    });
    const tenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 10))
        .toISOString()
        .split("T")[0];
    const response = await notionClient.databases.query({
        database_id: databaseId,
        filter: {
            and: [
                {
                    or: [
                        {
                            property: "Date",
                            date: {
                                after: tenDaysAgo
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
    // response.results.forEach((result) => {
    //     console.log(result);
    // });
    return response.results.map((result) => {
        return convertToNotionTask(result as DatabaseObjectResponse);
    });
}
