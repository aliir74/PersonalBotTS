import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { MY_TELEGRAM_USER_ID } from "../../environments";
import { log } from "../logger";
import { bot } from "./bot";

const apiId = process.env.TELEGRAM_API_ID;
const apiHash = process.env.TELEGRAM_API_HASH;
const stringSession = new StringSession(
    process.env.TELEGRAM_STRING_SESSION || ""
);

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

export async function initializePersonalAccount() {
    try {
        await personalAccount.connect();

        if (!(await personalAccount.isUserAuthorized())) {
            throw new Error(
                "User not authorized. Please run the auth script first."
            );
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

async function askQuestion(question: string): Promise<string> {
    await bot.api.sendMessage(MY_TELEGRAM_USER_ID, question);

    return new Promise((resolve) => {
        bot.on("message", async (ctx) => {
            if (ctx.message?.chat.id !== MY_TELEGRAM_USER_ID) return;
            if (!ctx.message.text) return;

            resolve(ctx.message.text);
        });
    });
}

export async function authenticateTelegramAccount() {
    await log(
        "Starting Telegram auth process...",
        "Telegram Auth",
        "success",
        true
    );

    const apiId = await askQuestion("Enter your API ID:");
    const apiHash = await askQuestion("Enter your API Hash:");
    const stringSession = new StringSession("");

    await log("Creating client...", "Telegram Auth", "success", true);

    const client = new TelegramClient(stringSession, parseInt(apiId), apiHash, {
        connectionRetries: 5
    });

    await client.start({
        phoneNumber: async () => await askQuestion("Enter your phone number:"),
        password: async () =>
            await askQuestion("Enter your password (if any):"),
        phoneCode: async () =>
            await askQuestion("Enter the code you received:"),
        onError: async (err) => {
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
}
