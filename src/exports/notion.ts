import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import {
    notionClient,
    NotionTask,
    TaskStatus,
    DUE_DATE_PROPERTY
} from "../clients/notion";
import { NOTION_DATABASE_ID } from "../environments";
import { convertToNotionTask } from "../clients/notion";

export async function getTasksByDueDate(
    dueDate: Date,
    filterAutomated: boolean = true
): Promise<NotionTask[]> {
    const date = dueDate.toISOString().split("T")[0];
    console.log("Getting tasks by due date", date);
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
    console.log(`Converting ${response.results.length} record to notion task`);
    return response.results.map((result) => {
        return convertToNotionTask(result as DatabaseObjectResponse);
    });
}
