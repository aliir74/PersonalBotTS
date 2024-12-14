import { bot } from "../clients/telegram/bot";
import { log } from "../clients/logger";
import { TELEGRAM_NOTES_FROM_A_DEVELOPER_CHANNEL_ID } from "../environments";
import { retry } from "ts-retry-promise";
import { DEFAULT_RETRY_CONFIG } from "../consts";
import { Context } from "grammy";

const LOG_NAME = "Add Signature on Telegram Channel";
const SIGNATURE = "👨‍💻 @notesfromadeveloper";

// Listen for new channel posts
bot.on("channel_post", async (ctx: Context) => {
    try {
        if (ctx.chat?.id !== TELEGRAM_NOTES_FROM_A_DEVELOPER_CHANNEL_ID) {
            return;
        }
        const message = ctx.update.channel_post;

        // Check if message has text and doesn't have signature
        if (message?.text && !message.text.includes(SIGNATURE)) {
            const newText = `${message.text}\n\n\n${SIGNATURE}`;

            await retry(async () => {
                await ctx.api.editMessageText(
                    TELEGRAM_NOTES_FROM_A_DEVELOPER_CHANNEL_ID,
                    message.message_id,
                    newText
                );
            }, DEFAULT_RETRY_CONFIG);

            await log(
                `Added signature to message ID: ${message.message_id}`,
                LOG_NAME,
                "success",
                false
            );
        }
    } catch (error) {
        await log((error as Error).message, LOG_NAME, "error", true);
    }
});
