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

personalAccount.addEventHandler(async (event: NewMessageEvent) => {
    try {
        const message = event.message;

        // Check if message is in the target channel
        if (
            message.peerId.className !== "PeerChannel" ||
            Number(message.peerId.channelId) !==
                TELEGRAM_NOTES_FROM_A_DEVELOPER_CHANNEL_ID
        ) {
            return;
        }

        // Check if message is from the user
        if (
            message.fromId?.className !== "PeerUser" ||
            Number(message.fromId.userId) !== MY_TELEGRAM_USER_ID
        ) {
            return;
        }

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
        await log(
            (error as Error).message,
            "Telegram Signature Bot",
            "error",
            true
        );
    }
}, new NewMessage({}));
