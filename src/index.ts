import { notionToEmail } from "./jobs/notionToEmail";
import { schedule } from "node-cron";
import { clickupToNotion } from "./jobs/clickupToNotion";
import { mrbilitToTelegram } from "./jobs/mrbilitToTelegram";
import { City, FilterTrain } from "./clients/mrbilit/types";
import {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    GOOGLE_REFRESH_TOKEN,
    MY_TELEGRAM_USER_ID,
    TELEGRAM_GROUP_ID
} from "./environments";
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
    // Tehran to Shahrud
    const filterTehranToShahrud: FilterTrain = {
        PassengerCount: 4,
        DepartureTime: {
            After: new Date(Date.UTC(2024, 10, 6, 0)),
            Before: new Date(Date.UTC(2024, 10, 6, 20))
        },
        BusInclude: false,
        CompartmentCapacityInclude: true
    };
    try {
        await mrbilitToTelegram(
            City.Tehran,
            City.Shahrud,
            new Date(Date.UTC(2024, 10, 6)),
            filterTehranToShahrud.PassengerCount,
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
    //Shahrud to Tehran
    const filterShahrudToTehran: FilterTrain = {
        PassengerCount: 1,
        DepartureTime: {
            After: new Date(Date.UTC(2024, 10, 8, 0)),
            Before: new Date(Date.UTC(2024, 10, 8, 20))
        },
        BusInclude: true,
        CompartmentCapacityInclude: false
    };
    try {
        await mrbilitToTelegram(
            City.Shahrud,
            City.Tehran,
            new Date(Date.UTC(2024, 10, 8)),
            filterShahrudToTehran.PassengerCount,
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

    //Tehran to Mashhad
    const filterTehranToMashhad: FilterTrain = {
        PassengerCount: 4,
        DepartureTime: {
            After: new Date(Date.UTC(2024, 10, 6, 0)),
            Before: new Date(Date.UTC(2024, 10, 6, 20))
        },
        BusInclude: false,
        CompartmentCapacityInclude: true
    };
    try {
        await mrbilitToTelegram(
            City.Tehran,
            City.Mashhad,
            new Date(Date.UTC(2024, 10, 6)),
            filterTehranToMashhad.PassengerCount,
            TELEGRAM_GROUP_ID,
            filterTehranToMashhad
        );
    } catch (error) {
        await log(
            (error as Error).message,
            "Mrbilit to Telegram",
            "error",
            true
        );
    }

    // Mashhad to Tehran
    const filterMashhadToTehran: FilterTrain = {
        PassengerCount: 1,
        DepartureTime: {
            After: new Date(Date.UTC(2024, 10, 8, 0)),
            Before: new Date(Date.UTC(2024, 10, 8, 20))
        },
        BusInclude: true,
        CompartmentCapacityInclude: false
    };
    try {
        await mrbilitToTelegram(
            City.Mashhad,
            City.Tehran,
            new Date(Date.UTC(2024, 10, 8)),
            filterMashhadToTehran.PassengerCount,
            TELEGRAM_GROUP_ID,
            filterMashhadToTehran
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
