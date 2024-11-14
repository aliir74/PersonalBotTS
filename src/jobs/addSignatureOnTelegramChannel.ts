import { personalAccount } from "../clients/telegram/personalAccount";
import {
    MY_TELEGRAM_USER_ID,
    TELEGRAM_NOTES_FROM_A_DEVELOPER_CHANNEL_ID
} from "../environments";
import { log } from "../clients/logger";
import { NewMessage, NewMessageEvent } from "telegram/events";
import {
    SIGNATURE_PREMIUM_EMOJI_DOCUMENT_ID,
    CHANNEL_USERNAME,
    SIGNATURE
} from "../consts";

export async function subscribeAddSignatureOnTelegramChannelEventHandler() {
    // Add specific filters for the channel
    const filter = {
        chats: [TELEGRAM_NOTES_FROM_A_DEVELOPER_CHANNEL_ID],
        fromUsers: [MY_TELEGRAM_USER_ID]
    };

    console.log("Setting up signature event handler with filter:", filter);

    personalAccount.addEventHandler(async (event: NewMessageEvent) => {
        console.log("New message event received:", {
            chatId: event.message.peerId,
            fromId: event.message.fromId,
            text: event.message.text
        });

        try {
            const message = event.message;

            // Check if message has text
            if (!message.text) {
                return;
            }

            // Check if signature is already present
            if (message.text.endsWith(SIGNATURE)) {
                return;
            }

            // Edit the message with mention entity and custom emoji
            await message.edit({
                text: message.text + SIGNATURE,
                entities: [
                    {
                        _: "messageEntityCustomEmoji",
                        offset: message.text.length + 3, // After newlines
                        length: 1,
                        documentId: SIGNATURE_PREMIUM_EMOJI_DOCUMENT_ID
                    },
                    {
                        _: "messageEntityMention",
                        offset: message.text.length + 4, // After newlines + emoji
                        length: CHANNEL_USERNAME.length
                    }
                ]
            } as any);

            await log(
                "Added signature to message",
                "Telegram Signature Bot",
                "success"
            );
        } catch (error) {
            console.error("Error in signature handler:", error);
            await log(
                (error as Error).message,
                "Telegram Signature Bot",
                "error",
                true
            );
        }
    }, new NewMessage(filter));

    console.log("Signature event handler setup completed");
}
