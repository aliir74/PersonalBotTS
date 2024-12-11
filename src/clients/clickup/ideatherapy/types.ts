export enum IdeatherapyClickUpStatusName {
    TODO = "to do",
    FEASABLITY = "feasability",
    IN_PROGRESS = "in progress",
    COMPLETE = "complete",
    CLOSED = "closed"
}

export interface IdeatherapyClickUpStatus {
    status: IdeatherapyClickUpStatusName;
    color: string;
}
