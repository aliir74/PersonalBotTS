import {
    DatabaseObjectResponse,
    PageObjectResponse
} from "@notionhq/client/build/src/api-endpoints";
import { NotionTask } from "../types";
import { notionClient } from "../index";
import { NOTION_PERSONAL_DATABASE_ID } from "../../../environments";
import { convertNotionResponseToTask } from "../types";
import { PersonalTaskStatus } from "./types";

export async function getPersonalTasksByProjectNameFilter(
    doesNotContain: string
): Promise<NotionTask[]> {
    const response = await notionClient.databases.query({
        database_id: NOTION_PERSONAL_DATABASE_ID,
        filter: {
            property: "Name",
            rich_text: {
                does_not_contain: doesNotContain
            }
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
    return tasks;
}

export async function updateTaskName(id: string, name: string): Promise<void> {
    await notionClient.pages.update({
        page_id: id,
        properties: {
            Name: { rich_text: [{ text: { content: name } }] }
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
