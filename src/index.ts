import { notionToEmail } from "./jobs/notionToEmail";
import { schedule } from "node-cron";
import { clickupToNotion } from "./jobs/clickupToNotion";
import "./jobs/telegramBot";
import {
    // connectPersonalAccount,
    initializePersonalAccount,
    personalAccount
} from "./clients/telegram/personalAccount";
// import { subscribeAddSignatureOnTelegramChannelEventHandler } from "./jobs/addSignatureOnTelegramChannel";
import { log } from "./clients/logger";
import { automateNotionWorkLog } from "./jobs/automateNotionWorkLog";
import { NODE_ENV } from "./environments";

initializePersonalAccount().then(async () => {
    console.log("Personal account connected");
    try {
        // await subscribeAddSignatureOnTelegramChannelEventHandler();
        console.log("Signature handler subscribed successfully");
    } catch (error) {
        console.error("Failed to subscribe signature handler:", error);
    }
    if (await personalAccount.isUserAuthorized()) {
        console.log("I am authorized. I can call functions and use requests");
    } else {
        console.log(
            "I am not logged in. I need to sign in first before being able to call methods"
        );
    }
});

if (NODE_ENV === "production") {
    // Every 15 minutes, between 08:00 AM and 11:59 PM, All days
    schedule("*/15 8-23 * * *", async () => {
        try {
            await notionToEmail();
        } catch (error) {
            await log(
                (error as Error).message,
                "Notion to Email",
                "error",
                true
            );
        }
    });

    // Every 5 minutes, between 08:00 AM and 11:59 PM, Weekdays
    schedule("*/5 8-23 * * 1-5", async () => {
        try {
            await clickupToNotion();
        } catch (error) {
            await log(
                (error as Error).message,
                "ClickUp to Notion",
                "error",
                true
            );
        }
    });

    // Every 15 minutes, Bot active check
    schedule("0 0 * * *", async () => {
        await log("Bot is active", "Bot active check", "success", true);
    });

    // Every 15 minutes, Automate Notion Worklog
    schedule("*/15 8-23 * * *", async () => {
        try {
            await automateNotionWorkLog();
        } catch (error) {
            await log(
                (error as Error).message,
                "Automate Notion Worklog",
                "error",
                true
            );
        }
    });
}
