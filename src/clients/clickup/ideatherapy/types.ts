export enum IdeatherapyClickUpStatusName {
    TODO = "TO DO",
    FEASABLITY = "FEASABLITY",
    COMPLETE = "COMPLETE"
}

export interface IdeatherapyClickUpStatus {
    status: IdeatherapyClickUpStatusName;
    color: string;
}
