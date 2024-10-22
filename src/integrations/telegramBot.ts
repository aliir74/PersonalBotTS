import { bot } from "../clients/telegram/bot";
import { TELEGRAM_GROUP_ID } from "../environments";
import { mrbilitToTelegram } from "./mrbilitToTelegram";

bot.command("status_trains", async (ctx) => {
    console.log("[BOT] /status_trains");
    if (ctx.message?.chat.id !== TELEGRAM_GROUP_ID) {
        return;
    }
    await mrbilitToTelegram(1, 130, new Date(Date.UTC(2024, 10, 6)), 5);
    await mrbilitToTelegram(130, 1, new Date(Date.UTC(2024, 10, 8)), 1);
});
