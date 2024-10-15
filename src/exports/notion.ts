import {
    DatabaseObjectResponse,
    PropertyItemObjectResponse
} from "@notionhq/client/build/src/api-endpoints";
import { notionClient } from "../clients/notion";
import { NOTION_DATABASE_ID } from "../environments";

const DUE_DATE_PROPERTY = "Due";

enum TaskStatus {
    DONE = "Done",
    IN_PROGRESS = "In Progress",
    NOT_STARTED = "Not Started"
}

enum TaskPriority {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High"
}

type NotionProperties = {
    completedOn: boolean;
    taskName: string;
    status: TaskStatus;
    due: string;
    priority: TaskPriority;
    projectId: string;
};

export type NotionTask = {
    id: string;
    createdTime: Date;
    lastEditedTime: Date;
    archived: boolean;
    inTrash: boolean;
    icon: string | null;
    cover: string | null;
    url: string;
    properties: NotionProperties;
};

function convertToNotionProperty(
    params: Record<string, any>
): NotionProperties {
    return {
        completedOn: params["Completed on"]?.date,
        taskName: params["Task name"]?.title[0]?.text?.content,
        status: params.Status?.status?.name,
        due: params.Due?.date?.start,
        priority: params.Priority?.select?.name ?? TaskPriority.LOW,
        projectId: params.Project?.relation[0]?.id
    };
}

function convertToNotionTask(params: DatabaseObjectResponse): NotionTask {
    return {
        id: params.id,
        createdTime: new Date(params.created_time),
        lastEditedTime: new Date(params.last_edited_time),
        archived: params.archived,
        inTrash: params.in_trash,
        icon: params.icon?.type === "emoji" ? params.icon.emoji : null,
        cover:
            params.cover?.type === "external"
                ? params.cover.external.url
                : null,
        url: params.url,
        properties: convertToNotionProperty(params.properties)
    };
}

export async function getTasksByDueDate(dueDate: Date): Promise<NotionTask[]> {
    const date = dueDate.toISOString().split("T")[0];
    console.log("Getting tasks by due date", date);
    const response = await notionClient.databases.query({
        database_id: NOTION_DATABASE_ID,
        filter: {
            and: [
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
            ]
        }
    });
    console.log(`Converting ${response.results.length} record to notion task`);
    return response.results.map((result) => {
        return convertToNotionTask(result as DatabaseObjectResponse);
    });
}
