import { schedule } from "node-cron";
import {
    workClickupToNotion,
    LOG_NAME as WORK_LOG_NAME
} from "./jobs/workClickupToNotion";
import "./jobs/telegramBot";
import { log } from "./clients/logger";
import {
    automateNotionWorkLog,
    setCompletedMonthForWorklogTasks
} from "./jobs/automateNotionWorkLog";
import { NODE_ENV } from "./environments";
import { updateDoneTasks } from "./jobs/automateNotionPersonalDashboard";
import {
    ideatherapyClickupToNotion,
    LOG_NAME as IDEATHERAPY_LOG_NAME
} from "./jobs/ideatherapyClickupToNotion";

if (NODE_ENV !== "production") {
    console.log("PersonalBot is running...");
    // ideatherapyClickupToNotion();
} else {
    // Every 5 minutes, between 08:00 AM and 11:59 PM, Weekdays
    schedule("*/5 8-23 * * 1-5", async () => {
        try {
            await workClickupToNotion();
        } catch (error) {
            await log((error as Error).message, WORK_LOG_NAME, "error", true);
        }
    });

    // Every 5 minutes
    schedule("*/5 * * * *", async () => {
        try {
            await ideatherapyClickupToNotion();
        } catch (error) {
            await log(
                (error as Error).message,
                IDEATHERAPY_LOG_NAME,
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
    schedule("*/15 8-23 * * 1-5", async () => {
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

    // Every 15 minutes, Automate Notion Personal Dashboard
    schedule("*/15 8-23 * * *", async () => {
        try {
            await updateDoneTasks();
        } catch (error) {
            await log(
                (error as Error).message,
                "Automate Notion Personal Dashboard",
                "error",
                true
            );
        }
    });

    // Every month, Set completed month for worklog tasks
    schedule("0 0 1 * *", async () => {
        try {
            await setCompletedMonthForWorklogTasks();
        } catch (error) {
            await log(
                (error as Error).message,
                "Set completed month for worklog tasks",
                "error",
                true
            );
        }
    });
}
