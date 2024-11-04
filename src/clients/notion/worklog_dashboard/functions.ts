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
