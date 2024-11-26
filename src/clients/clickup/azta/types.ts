export interface AztaClickUpStatus {
    status:
        | "BACKLOG"
        | "TODO"
        | "IN PROGRESS"
        | "NEEDS REVIEW"
        | "DONE"
        | "COMPLETED";
    color: string;
}
