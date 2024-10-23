import { botLog } from "./telegram/functions";

export async function log(
    message: string,
    integrationName: string,
    status: "success" | "error",
    telegramMessage: boolean = false
) {
    const consoleLogger = status === "success" ? console.log : console.error;
    consoleLogger(`[${integrationName}] ${message}`);
    if (telegramMessage) {
        await botLog(message, integrationName, status);
    }
}
