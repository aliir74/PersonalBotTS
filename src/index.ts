import { notionToEmail } from "./jobs/notionToEmail";
import { schedule } from "node-cron";
import { clickupToNotion } from "./jobs/clickupToNotion";
import { mrbilitToTelegram } from "./jobs/mrbilitToTelegram";
import { FilterTrain } from "./clients/mrbilit/types";
import { MY_TELEGRAM_USER_ID, TELEGRAM_GROUP_ID } from "./environments";
import { bot } from "./clients/telegram/bot";
import "./jobs/telegramBot";
import { log } from "./clients/logger";
import { automateNotionWorkLog } from "./jobs/automateNotionWorkLog";
// Every 15 minutes, between 08:00 AM and 11:59 PM, All days
schedule("*/15 8-23 * * *", async () => {
    try {
        await notionToEmail();
    } catch (error) {
        await log((error as Error).message, "Notion to Email", "error", true);
    }
});

// Every 5 minutes, between 08:00 AM and 11:59 PM, Weekdays
schedule("*/5 8-23 * * 1-5", async () => {
    try {
        await clickupToNotion();
    } catch (error) {
        await log((error as Error).message, "ClickUp to Notion", "error", true);
    }
});

// Every 15 minutes, Check trains
schedule("*/15 * * * *", async () => {
    if (new Date() > new Date(Date.UTC(2024, 10, 8))) {
        return;
    }
    const filterTehranToShahrud: FilterTrain = {
        PassengerCount: 5,
        DepartureTime: {
            After: new Date(Date.UTC(2024, 10, 6, 14)),
            Before: new Date(Date.UTC(2024, 10, 6, 20))
        },
        BusInclude: false,
        CompartmentCapacityInclude: true
    };
    try {
        await mrbilitToTelegram(
            1,
            130,
            new Date(Date.UTC(2024, 10, 6)),
            5,
            TELEGRAM_GROUP_ID,
            filterTehranToShahrud
        );
    } catch (error) {
        await log(
            (error as Error).message,
            "Mrbilit to Telegram",
            "error",
            true
        );
    }
    const filterShahrudToTehran: FilterTrain = {
        PassengerCount: 1,
        DepartureTime: {
            After: new Date(Date.UTC(2024, 10, 8, 16)),
            Before: new Date(Date.UTC(2024, 10, 8, 18))
        },
        BusInclude: false,
        CompartmentCapacityInclude: false
    };
    try {
        await mrbilitToTelegram(
            130,
            1,
            new Date(Date.UTC(2024, 10, 8)),
            1,
            TELEGRAM_GROUP_ID,
            filterShahrudToTehran
        );
    } catch (error) {
        await log(
            (error as Error).message,
            "Mrbilit to Telegram",
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
