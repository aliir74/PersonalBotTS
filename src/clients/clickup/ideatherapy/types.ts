export enum IdeatherapyClickUpStatusName {
    TODO = "to do",
    FEASABLITY = "feasability",
    IN_PROGRESS = "in progress",
    COMPLETE = "complete",
    ARCHIVE = "archive"
}

export interface IdeatherapyClickUpStatus {
    status: IdeatherapyClickUpStatusName;
    color: string;
}
