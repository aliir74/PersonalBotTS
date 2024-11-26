export interface WorkClickUpStatus {
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
