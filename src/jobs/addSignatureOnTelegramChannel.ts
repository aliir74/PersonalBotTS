import { bot } from "../clients/telegram/bot";
import { log } from "../clients/logger";
import { TELEGRAM_NOTES_FROM_A_DEVELOPER_CHANNEL_ID } from "../environments";
// const TELEGRAM_NOTES_FROM_A_DEVELOPER_CHANNEL_ID = -1002277391398;
const LOG_NAME = "Add Signature on Telegram Channel";
const SIGNATURE = "👨‍💻 @notesfromadeveloper";
const MAX_MESSAGES_TO_PROCESS = 5;

export async function addSignatureOnTelegramChannel(
    manualTrigger: boolean = false
) {
    try {
        const channel = await bot.api.getChat(
            TELEGRAM_NOTES_FROM_A_DEVELOPER_CHANNEL_ID
        );

        if (!channel) {
            throw new Error("Channel not found");
        }

        const messages = await bot.api.getUpdates({
            allowed_updates: ["channel_post"],
            offset: -MAX_MESSAGES_TO_PROCESS,
            limit: MAX_MESSAGES_TO_PROCESS
        });

        messages.forEach(async (message) => {
            const channelPost = message.channel_post;
            if (channelPost && !channelPost.text?.includes(SIGNATURE)) {
                const newText = `${channelPost.text}\n\n\n${SIGNATURE}`;
                await bot.api.editMessageText(
                    TELEGRAM_NOTES_FROM_A_DEVELOPER_CHANNEL_ID,
                    channelPost.message_id,
                    newText
                );
                await log(
                    `Added signature to message ID: ${channelPost.message_id}`,
                    LOG_NAME,
                    "success",
                    manualTrigger
                );
            } else if (manualTrigger) {
                await log(
                    "Message already has signature",
                    LOG_NAME,
                    "success",
                    true
                );
            }
        });
    } catch (error) {
        await log((error as Error).message, LOG_NAME, "error", true);
        throw error;
    }
}
