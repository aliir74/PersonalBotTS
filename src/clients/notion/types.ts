import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import {
    convertNotionResponseToPersonalNotionProperties,
    PersonalNotionProperties
} from "./personal_dashboard/types";
import { getPersonalProject } from "./personal_dashboard/functions";
import { personalDashboardIdToProjectName } from "./personal_dashboard/mappings";
import {
    WorklogNotionProperties,
    convertNotionResponseToWorklogNotionProperties
} from "./worklog_dashboard/types";

export type NotionTask = {
    id: string;
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

export async function convertNotionResponseToTask(
    params: DatabaseObjectResponse,
    personal: boolean
): Promise<NotionTask> {
    let projectName = "";
    let name = "";
    let emoji = "";
    if (personal) {
        const projectId = (params.properties.Project as any).relation[0].id;
        if (projectId && personalDashboardIdToProjectName[projectId]) {
            projectName = personalDashboardIdToProjectName[projectId];
        } else {
            const project = await getPersonalProject(projectId);
            name = (project.properties["Project name"] as any)?.title[0]?.text
                ?.content;
            emoji = (project.icon as any).emoji ?? "";
            projectName = emoji + name;
            personalDashboardIdToProjectName[projectId] = emoji + name;
        }
    }
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
            ? convertNotionResponseToPersonalNotionProperties(
                  params.properties,
                  projectName
              )
            : convertNotionResponseToWorklogNotionProperties(params.properties)
    };
}

export function isPersonalNotionProperties(
    properties: PersonalNotionProperties | WorklogNotionProperties
): properties is PersonalNotionProperties {
    return properties.dashboard === "Personal";
}
