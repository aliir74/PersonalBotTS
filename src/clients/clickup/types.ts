import { AztaClickUpStatus } from "./azta/types";
import { IdeatherapyClickUpStatus } from "./ideatherapy/types";
import { WorkClickUpStatus } from "./work/types";

export interface ClickUpResponse {
    tasks: ClickUpTask[];
    last_page: boolean;
}

export interface ClickUpTask {
    id: string;
    name: string;
    description: string;
    status: WorkClickUpStatus | IdeatherapyClickUpStatus | AztaClickUpStatus;
    priority: ClickUpPriority | null;
    assignees: ClickUpAssignee[];
    url: string;
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
