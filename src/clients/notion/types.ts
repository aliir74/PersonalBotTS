import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { ClickUpStatus, ClickUpTask } from "../clickup/types";

export const DUE_DATE_PROPERTY = "Due";

export enum TaskStatus {
    DONE = "Done",
    IN_PROGRESS = "In progress",
    NOT_STARTED = "Not started",
    BLOCKED = "Blocked"
}

export enum TaskPriority {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High"
}

export enum TaskType {
    DEVELOPMENT = "Development",
    ANALYSIS = "Analysis",
    REVIEW = "Review",
    VERIFY = "Verify",
    DEPLOY = "Deploy"
}

export type NotionProperties = {
    completedOn?: boolean;
    taskName: string;
    status: TaskStatus;
    due?: string;
    priority?: TaskPriority;
    projectId?: string;
    automated: boolean;
    type?: TaskType;
    link?: string;
};

export type NotionTask = {
    id?: string;
    createdTime?: Date;
    lastEditedTime?: Date;
    archived?: boolean;
    inTrash?: boolean;
    icon?: string | null;
    cover?: string | null;
    url?: string;
    content: string;
    properties: NotionProperties;
};

export function convertToNotionProperty(
    params: Record<string, any>
): NotionProperties {
    return {
        completedOn: params["Completed on"]?.date,
        taskName:
            params["Task name"]?.title[0]?.text?.content ||
            params["Name"]?.title[0]?.text?.content,
        status: params.Status?.status?.name,
        due: params.Due?.date?.start,
        priority: params.Priority?.select?.name ?? TaskPriority.LOW,
        automated: params.Automated?.checkbox,
        type: params.Type?.status?.name,
        link: params.Link?.url
    };
}

export function convertToNotionTask(
    params: DatabaseObjectResponse
): NotionTask {
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
        content: "",
        properties: convertToNotionProperty(params.properties)
    };
}
