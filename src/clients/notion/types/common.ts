import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import {
    convertNotionResponseToPersonalNotionProperties,
    PersonalNotionProperties
} from "./personal_database";
import {
    convertNotionResponseToWorklogNotionProperties,
    WorklogNotionProperties
} from "./worklog_database";

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
    properties: PersonalNotionProperties | WorklogNotionProperties;
};

export function convertNotionResponseToTask(
    params: DatabaseObjectResponse,
    personal: boolean
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
        properties: personal
            ? convertNotionResponseToPersonalNotionProperties(params.properties)
            : convertNotionResponseToWorklogNotionProperties(params.properties)
    };
}

export function isPersonalNotionProperties(
    properties: PersonalNotionProperties | WorklogNotionProperties
): properties is PersonalNotionProperties {
    return properties.dashboard === "Personal";
}
