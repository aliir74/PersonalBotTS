export enum WorklogTaskType {
    DEVELOPMENT = "Development",
    ANALYSIS = "Analysis",
    REVIEW = "Review",
    VERIFY = "Verify",
    DEPLOY = "Deploy"
}

export enum WorklogTaskStatus {
    DONE = "Done",
    IN_PROGRESS = "In progress",
    NOT_STARTED = "Not started",
    BLOCKED = "Blocked"
}

export type WorklogNotionProperties = {
    dashboard: "Worklog";
    name: string;
    status: WorklogTaskStatus;
    date: string;
    priority: boolean;
    projectId?: string;
    automated: boolean;
    type: WorklogTaskType;
    link: string;
};


export function convertNotionResponseToWorklogNotionProperties(
    params: Record<string, any>
): WorklogNotionProperties {
    return {
        dashboard: "Worklog",
        name: params.Name?.title[0]?.text?.content,
        status: params.Status?.status?.name,
        date: params.Date?.date?.start,
        priority: params.Priority?.checkbox,
        automated: params.Automated?.checkbox,
        type: params.Type?.status?.name,
        link: params.Link?.url
    };
}
