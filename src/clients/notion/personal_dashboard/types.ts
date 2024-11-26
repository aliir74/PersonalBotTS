export const DUE_DATE_PROPERTY = "Due";
export const STATUS_PROPERTY = "Status";
export const PRIORITY_PROPERTY = "Priority";
export const AUTOMATED_PROPERTY = "Automated";
export const LINK_PROPERTY = "Link";

export enum PersonalTaskStatus {
    DONE = "Done",
    IN_PROGRESS = "In Progress",
    NOT_STARTED = "Not Started",
    ARCHIVED = "Archived"
}

export enum PersonalTaskPriority {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High"
}

export type PersonalNotionProperties = {
    dashboard: "Personal";
    completedOn?: boolean;
    name: string;
    status: PersonalTaskStatus;
    due?: string;
    priority?: PersonalTaskPriority;
    automated: boolean;
    url: string;
    projectName?: string;
    weekTask: boolean;
};

export function convertNotionResponseToPersonalNotionProperties(
    params: Record<string, any>,
    projectName: string
): PersonalNotionProperties {
    return {
        dashboard: "Personal",
        completedOn: params["Completed on"]?.date,
        name: params["Task name"]?.title[0]?.text?.content,
        status: params.Status?.status?.name,
        due: params.Due?.date?.start,
        priority: params.Priority?.select?.name ?? PersonalTaskPriority.LOW,
        automated: params.Automated?.checkbox,
        url: params.URL?.url,
        projectName: projectName,
        weekTask: params["Week task"]?.checkbox
    };
}
