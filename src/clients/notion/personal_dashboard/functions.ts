import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionTask } from "../types";
import { notionClient } from "../index";
import { NOTION_PERSONAL_DATABASE_ID } from "../../../environments";
import { convertNotionResponseToTask } from "../types";
import { PersonalTaskStatus } from "./types";

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
    return response.results.map((result) => {
        return convertNotionResponseToTask(
            result as DatabaseObjectResponse,
            true
        );
    });
}
