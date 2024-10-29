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
    completedOn?: boolean;
    name: string;
    status: PersonalTaskStatus;
    due?: string;
    priority: PersonalTaskPriority;
    automated: boolean;
    link: string;
};

export function convertNotionResponseToPersonalNotionProperties(
    params: Record<string, any>
): PersonalNotionProperties {
    return {
        completedOn: params["Completed on"]?.date,
        name: params["Name"]?.title[0]?.text?.content,
        status: params.Status?.status?.name,
        due: params.Due?.date?.start,
        priority: params.Priority?.select?.name ?? PersonalTaskPriority.LOW,
        automated: params.Automated?.checkbox,
        link: params.Link?.url
    };
}
