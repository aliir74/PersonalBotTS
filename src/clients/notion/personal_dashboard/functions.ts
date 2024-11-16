import {
    DatabaseObjectResponse,
    PageObjectResponse
} from "@notionhq/client/build/src/api-endpoints";
import { NotionTask } from "../types";
import { notionClient } from "../index";
import { NOTION_PERSONAL_DATABASE_ID } from "../../../environments";
import { convertNotionResponseToTask } from "../types";
import { PersonalTaskStatus } from "./types";

export async function getPersonalTasksByEmojiFilter(
    emoji: string
): Promise<NotionTask[]> {
    const threeMonthsAgo = new Date(
        new Date().setMonth(new Date().getMonth() - 3)
    )
        .toISOString()
        .split("T")[0];
    const response = await notionClient.databases.query({
        database_id: NOTION_PERSONAL_DATABASE_ID,
        filter: {
            and: [
                {
                    or: [
                        {
                            property: "Due",
                            date: {
                                after: threeMonthsAgo
                            }
                        },
                        {
                            property: "Due",
                            date: {
                                is_empty: true
                            }
                        }
                    ]
                },
                {
                    property: "Status",
                    status: {
                        equals: PersonalTaskStatus.DONE
                    }
                }
            ]
        }
    });
    const filteredResults = response.results.filter((result) => {
        const pageResult = result as PageObjectResponse;
        return !(
            pageResult.icon &&
            pageResult.icon.type === "emoji" &&
            pageResult.icon.emoji === emoji
        );
    });
    const tasks = await Promise.all(
        filteredResults.map((result) => {
            return convertNotionResponseToTask(
                result as DatabaseObjectResponse,
                true
            );
        })
    );
    return tasks;
}

export async function updateIcon(id: string, icon: string): Promise<void> {
    await notionClient.pages.update({
        page_id: id,
        icon: {
            type: "emoji",
            emoji: icon as any
        }
    });
}

export async function getPersonalTasksByDueDate(
    dueDate: Date,
    filterAutomated: boolean = true
): Promise<NotionTask[]> {
    const date = dueDate.toISOString().split("T")[0];
    const filters: any[] = [
        {
            property: "Due",
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
    const tasks = await Promise.all(
        response.results.map((result) => {
            return convertNotionResponseToTask(
                result as DatabaseObjectResponse,
                true
            );
        })
    );
    // console.log(tasks);
    return tasks;
}

export async function getPersonalProject(
    id: string
): Promise<PageObjectResponse> {
    const response = await notionClient.pages.retrieve({
        page_id: id
    });
    // console.log(response);
    return response as PageObjectResponse;
}
