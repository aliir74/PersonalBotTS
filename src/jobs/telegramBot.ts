import { bot } from "../clients/telegram/bot";
import { MY_TELEGRAM_USER_ID, TELEGRAM_GROUP_ID } from "../environments";
import { AbanEvent, mrbilitToTelegram } from "./mrbilitToTelegram";
import { clickupToNotion } from "./clickupToNotion";
import { notionToEmail } from "./notionToEmail";
import { log } from "../clients/logger";

bot.command("status_trains", async (ctx) => {
    if (
        ctx.message?.chat.id !== TELEGRAM_GROUP_ID &&
        ctx.message?.chat.id !== MY_TELEGRAM_USER_ID
    ) {
        return;
    }
    await log("/status_trains", "Telegram Bot", "success");
    const message = await ctx.reply("Wait a minute...");
    await AbanEvent();
    await ctx.api.deleteMessage(ctx.message?.chat.id, message.message_id);
});

bot.command("clickup_to_notion", async (ctx) => {
    await log("/clickup_to_notion", "Telegram Bot", "success");
    if (ctx.message?.chat.id !== MY_TELEGRAM_USER_ID) {
        return;
    }
    const message = await ctx.reply("Wait a minute...");
    try {
        await clickupToNotion(true);
    } catch (error) {
        await log((error as Error).message, "ClickUp to Notion", "error", true);
    }
    await ctx.api.deleteMessage(ctx.message?.chat.id, message.message_id);
});

bot.command("notion_to_email", async (ctx) => {
    await log("/notion_to_email", "Telegram Bot", "success");
    if (ctx.message?.chat.id !== MY_TELEGRAM_USER_ID) {
        return;
    }
    const message = await ctx.reply("Wait a minute...");
    try {
        await notionToEmail(true);
    } catch (error) {
        await log((error as Error).message, "Notion to Email", "error", true);
    }
    await ctx.api.deleteMessage(ctx.message?.chat.id, message.message_id);
});
