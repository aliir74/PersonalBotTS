export const DUE_DATE_PROPERTY = "Due";
export const STATUS_PROPERTY = "Status";
export const PRIORITY_PROPERTY = "Priority";
export const AUTOMATED_PROPERTY = "Automated";
export const LINK_PROPERTY = "Link";

export enum PersonalTaskStatus {
    DONE = "Done",
    IN_PROGRESS = "In progress",
    NOT_STARTED = "Not started",
    BLOCKED = "Blocked"
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
    priority: PersonalTaskPriority;
    automated: boolean;
    link: string;
    projectName: string;
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
        link: params.Link?.url,
        projectName: projectName
    };
}
