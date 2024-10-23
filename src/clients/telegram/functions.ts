import { bot } from "./bot";
import { MY_TELEGRAM_USER_ID } from "../../environments";

export async function botLog(
    message: string,
    integrationName: string,
    status: "success" | "error"
) {
    await bot.api.sendMessage(
        MY_TELEGRAM_USER_ID,
        `${status === "success" ? "✅" : "❌"} [${integrationName}] ${message}`
    );
}
