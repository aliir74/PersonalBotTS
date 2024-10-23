import { bot } from "../clients/telegram/bot";
import { MY_TELEGRAM_USER_ID, TELEGRAM_GROUP_ID } from "../environments";
import { mrbilitToTelegram } from "./mrbilitToTelegram";
import { clickupToNotion } from "./clickupToNotion";
import { notionToEmail } from "./notionToEmail";
import { log } from "../clients/logger";

bot.command("status_trains", async (ctx) => {
    await log("[BOT] /status_trains", "Telegram Bot", "success");
    if (
        ctx.message?.chat.id !== TELEGRAM_GROUP_ID &&
        ctx.message?.chat.id !== MY_TELEGRAM_USER_ID
    ) {
        return;
    }
    const message = await ctx.reply("Wait a minute...");
    try {
        await mrbilitToTelegram(1, 130, new Date(Date.UTC(2024, 10, 6)), 5);
        await mrbilitToTelegram(130, 1, new Date(Date.UTC(2024, 10, 8)), 1);
    } catch (error) {
        await log(
            (error as Error).message,
            "MrBilit to Telegram",
            "error",
            true
        );
    }
    await ctx.api.deleteMessage(ctx.message?.chat.id, message.message_id);
});

bot.command("clickup_to_notion", async (ctx) => {
    await log("[BOT] /clickup_to_notion", "Telegram Bot", "success");
    if (ctx.message?.chat.id !== MY_TELEGRAM_USER_ID) {
        return;
    }
    const message = await ctx.reply("Wait a minute...");
    try {
        await clickupToNotion();
    } catch (error) {
        await log((error as Error).message, "ClickUp to Notion", "error", true);
    }
    await ctx.api.deleteMessage(ctx.message?.chat.id, message.message_id);
});

bot.command("notion_to_email", async (ctx) => {
    await log("[BOT] /notion_to_email", "Telegram Bot", "success");
    if (ctx.message?.chat.id !== MY_TELEGRAM_USER_ID) {
        return;
    }
    const message = await ctx.reply("Wait a minute...");
    try {
        await notionToEmail();
    } catch (error) {
        await log((error as Error).message, "Notion to Email", "error", true);
    }
    await ctx.api.deleteMessage(ctx.message?.chat.id, message.message_id);
});
