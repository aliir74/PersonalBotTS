export interface ClickUpResponse {
    tasks: ClickUpTask[];
    last_page: boolean;
}

export interface ClickUpTask {
    id: string;
    name: string;
    description: string;
    status: ClickUpStatus;
    priority: ClickUpPriority | null;
    assignees: ClickUpAssignee[];
    url: string;
}

export interface ClickUpStatus {
    status:
        | "ready for analysis"
        | "in analysis"
        | "ready for development"
        | "in development"
        | "review+"
        | "verification+"
        | "excellence+"
        | "ready to deploy"
        | "deployed";
    color: string;
}

export interface ClickUpPriority {
    priority: "urgent" | "high" | "medium" | "low";
    color: string;
}

export interface ClickUpAssignee {
    id: string;
    username: string;
    color: string;
    profilePicture: string;
}
