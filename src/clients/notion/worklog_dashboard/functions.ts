import { NotionTask } from "../types";

import { WorklogNotionProperties, WorklogTaskStatus } from "./types";
import { notionClient } from "../index";
import { NOTION_WORKLOG_DATABASE_ID } from "../../../environments";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { convertNotionResponseToTask } from "../types";
import { log } from "../../logger";

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
    const notionTasks = await Promise.all(
        response.results.map((result) => {
            return convertNotionResponseToTask(
                result as DatabaseObjectResponse,
                false
            );
        })
    );
    await log(
        `${notionTasks.length} tasks from Notion`,
        "Get Worklog Notion Tasks",
        "success"
    );
    return notionTasks;
}

export async function getDoneTasksWithoutCompletedMonth(): Promise<
    NotionTask[]
> {
    let allResults: DatabaseObjectResponse[] = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        const response = await notionClient.databases.query({
            database_id: NOTION_WORKLOG_DATABASE_ID,
            start_cursor: startCursor as string | undefined,
            filter: {
                and: [
                    {
                        property: "Status",
                        status: {
                            equals: WorklogTaskStatus.DONE
                        }
                    },
                    {
                        property: "Date",
                        date: {
                            is_not_empty: true
                        }
                    },
                    {
                        property: "Completed Month",
                        date: {
                            is_empty: true
                        }
                    }
                ]
            }
        });

        allResults = [
            ...allResults,
            ...(response.results as DatabaseObjectResponse[])
        ];
        hasMore = response.has_more;
        startCursor = response.next_cursor;
    }

    const notionTasks = await Promise.all(
        allResults.map((result) => {
            return convertNotionResponseToTask(
                result as DatabaseObjectResponse,
                false
            );
        })
    );
    return notionTasks;
}

export async function setCompletedMonth(task: NotionTask) {
    if (task.properties.dashboard !== "Worklog") {
        return;
    }
    await notionClient.pages.update({
        page_id: task.id,
        properties: {
            Status: {
                status: {
                    name: WorklogTaskStatus.COMPLETED
                }
            },
            "Completed Month": {
                date: {
                    start:
                        new Date(task.properties.date)
                            .toISOString()
                            .slice(0, 7) + "-01"
                }
            }
        }
    });
}
