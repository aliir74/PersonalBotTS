import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import {
    TELEGRAM_API_HASH,
    TELEGRAM_API_ID,
    TELEGRAM_STRING_SESSION,
    MY_TELEGRAM_USER_ID
} from "../../environments";
import { log } from "../logger";
import { bot } from "./bot";
// import { NewMessage, NewMessageEvent } from "telegram/events";

const apiId = TELEGRAM_API_ID;
const apiHash = TELEGRAM_API_HASH;
const stringSession = new StringSession(TELEGRAM_STRING_SESSION);

if (!apiId || !apiHash) {
    throw new Error("TELEGRAM_API_ID and TELEGRAM_API_HASH must be set");
}

export const personalAccount = new TelegramClient(
    stringSession,
    parseInt(apiId),
    apiHash,
    {
        connectionRetries: 5
    }
);
// export async function connectPersonalAccount() {
//     try {
//         await personalAccount.connect();
//         console.log("Personal account connected");
//         personalAccount.addEventHandler(async (event: NewMessageEvent) => {
//             await log(event.message.text, "test handler", "success");
//         }, new NewMessage());
//     } catch (error) {
//         console.error("Error connecting personal account", error);
//     }
// }

export async function initializePersonalAccount() {
    try {
        await personalAccount.connect();

        if (!(await personalAccount.isUserAuthorized())) {
            await authenticateTelegramAccount();
        }

        await log(
            "Personal Telegram account connected successfully",
            "Telegram Personal Account",
            "success",
            true
        );
    } catch (error) {
        await log(
            (error as Error).message,
            "Telegram Personal Account",
            "error",
            true
        );
        await authenticateTelegramAccount();
    }
}

async function askQuestion(
    question: string,
    timeoutMs: number = 300000
): Promise<string> {
    await bot.api.sendMessage(MY_TELEGRAM_USER_ID, question);
    console.log("Question sent to user");

    return new Promise((resolve, reject) => {
        console.log("Waiting for user response...");
        let isHandlerActive = true;
        let timeoutId: NodeJS.Timeout;

        const handler = (ctx: any) => {
            if (ctx.message?.chat.id !== MY_TELEGRAM_USER_ID) return;

            if (isHandlerActive) {
                console.log("Received response from user");
                clearTimeout(timeoutId);
                cleanup();
                resolve(ctx.message.text);
            }
        };

        const cleanup = () => {
            isHandlerActive = false;
            // bot.off("message:text", handler);
        };

        // Set timeout
        timeoutId = setTimeout(() => {
            if (isHandlerActive) {
                cleanup();
                reject(new Error("Timeout waiting for code input"));
            }
        }, timeoutMs);

        // Subscribe to messages
        bot.on("message:text", handler);
        console.log("Subscribed to message handler");
    });
}

export async function authenticateTelegramAccount() {
    await log(
        "Starting Telegram auth process...",
        "Telegram Auth",
        "success",
        true
    );

    await personalAccount.connect();

    try {
        await personalAccount.start({
            phoneNumber: "+989023206232", // TODO: change this to a variable
            password: async () => "Linux3595132!", // TODO: change this to a variable
            phoneCode: async () => {
                try {
                    const code = await askQuestion(
                        "Please enter the verification code you received:",
                        300000
                    );
                    return code.trim();
                } catch (error: any) {
                    await log(
                        `Failed to get verification code: ${error.message}`,
                        "Telegram Auth",
                        "error",
                        true
                    );
                    throw error;
                }
            },
            onError: async (err: Error) => {
                await log(err.message, "Telegram Auth", "error", true);
                return false;
            }
        });

        const sessionString = stringSession.save();
        await log("Connected successfully!", "Telegram Auth", "success", true);
        await log(
            "Here's your string session, save it to your .env as TELEGRAM_STRING_SESSION and restart the app:",
            "Telegram Auth",
            "success",
            true
        );
        await log(sessionString, "Telegram Auth", "success", true);
    } catch (error: any) {
        await log(
            `Authentication failed: ${error.message}`,
            "Telegram Auth",
            "error",
            true
        );
        throw error;
    }
}

initializePersonalAccount();
