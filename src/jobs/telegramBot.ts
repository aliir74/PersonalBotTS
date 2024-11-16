import { bot } from "../clients/telegram/bot";
import { MY_TELEGRAM_USER_ID, TELEGRAM_GROUP_ID } from "../environments";
import { AbanEvent } from "./mrbilitToTelegram";
import { clickupToNotion } from "./clickupToNotion";
import { notionToEmail } from "./notionToEmail";
import { log } from "../clients/logger";
import { authenticateTelegramAccount } from "../clients/telegram/personalAccount";
import { updateDoneTasks } from "./automateNotionPersonalDashboard";
import { setCompletedMonthForWorklogTasks } from "./automateNotionWorkLog";

// Define commands interface
interface BotCommand {
    command: string;
    description: string;
}

// Define available commands
const commands: BotCommand[] = [
    // {
    //     command: "status_trains",
    //     description: "Check train status"
    // },
    {
        command: "notion_personal",
        description: "Automate Notion Personal Dashboard"
    },
    {
        command: "clickup_to_notion",
        description: "Sync ClickUp tasks to Notion"
    },
    {
        command: "notion_to_email",
        description: "Send Notion tasks to email"
    },
    {
        command: "auth_telegram_account",
        description: "Authenticate Telegram account"
    },
    {
        command: "restart_app",
        description: "Restart the bot application"
    },
    {
        command: "archive_worklog_tasks",
        description: "Archive worklog tasks"
    }
];

// Function to register commands
async function registerCommands() {
    try {
        await bot.api.setMyCommands(commands);
        await log(
            "Bot commands registered successfully",
            "Telegram Bot",
            "success",
            true
        );
    } catch (error) {
        await log((error as Error).message, "Telegram Bot", "error", true);
    }
}

registerCommands();

bot.command("status_trains", async (ctx) => {
    if (
        ctx.message?.chat.id !== TELEGRAM_GROUP_ID &&
        ctx.message?.chat.id !== MY_TELEGRAM_USER_ID
    ) {
        return;
    }
    await log("/status_trains", "Telegram Bot", "success");
    const message = await ctx.reply("Wait a minute...");
    await AbanEvent(true);
    await ctx.api.deleteMessage(ctx.message?.chat.id, message.message_id);
});

bot.command("clickup_to_notion", async (ctx) => {
    await log("/clickup_to_notion", "Telegram Bot", "success");
    if (ctx.message?.chat.id !== MY_TELEGRAM_USER_ID) {
        return;
    }
    const message = await ctx.reply("Wait a minute...");
    try {
        await clickupToNotion(true);
    } catch (error) {
        await log((error as Error).message, "ClickUp to Notion", "error", true);
    }
    await ctx.api.deleteMessage(ctx.message?.chat.id, message.message_id);
});

bot.command("notion_to_email", async (ctx) => {
    await log("/notion_to_email", "Telegram Bot", "success");
    if (ctx.message?.chat.id !== MY_TELEGRAM_USER_ID) {
        return;
    }
    const message = await ctx.reply("Wait a minute...");
    try {
        await notionToEmail(true);
    } catch (error) {
        await log((error as Error).message, "Notion to Email", "error", true);
    }
    await ctx.api.deleteMessage(ctx.message?.chat.id, message.message_id);
});

bot.command("auth_telegram_account", async (ctx) => {
    if (ctx.message?.chat.id !== MY_TELEGRAM_USER_ID) {
        return;
    }
    await log("/auth_telegram_account", "Telegram Bot", "success");
    const message = await ctx.reply("Starting auth process...");
    try {
        await authenticateTelegramAccount();
    } catch (error) {
        await log((error as Error).message, "Telegram Auth", "error", true);
    }
    await ctx.api.deleteMessage(ctx.message?.chat.id, message.message_id);
});

bot.command("restart_app", async (ctx) => {
    if (ctx.message?.chat.id !== MY_TELEGRAM_USER_ID) {
        return;
    }
    await log("/restart_app", "Telegram Bot", "success");
    const message = await ctx.reply("Restarting application in 3 seconds...");

    // Give some time for the message to be sent before exiting
    setTimeout(() => {
        process.exit(0);
    }, 3000);
});

bot.command("notion_personal", async (ctx) => {
    if (ctx.message?.chat.id !== MY_TELEGRAM_USER_ID) {
        return;
    }
    await log("/notion_personal", "Telegram Bot", "success");
    const message = await ctx.reply("Wait a minute...");
    try {
        await updateDoneTasks(true);
    } catch (error) {
        await log(
            (error as Error).message,
            "Notion Personal Dashboard",
            "error",
            true
        );
    }
    await ctx.api.deleteMessage(ctx.message?.chat.id, message.message_id);
});

bot.command("archive_worklog_tasks", async (ctx) => {
    if (ctx.message?.chat.id !== MY_TELEGRAM_USER_ID) {
        return;
    }
    await log("/archive_worklog_tasks", "Telegram Bot", "success");
    const message = await ctx.reply("Wait a minute...");
    try {
        await setCompletedMonthForWorklogTasks();
    } catch (error) {
        await log(
            (error as Error).message,
            "Archive Worklog Tasks",
            "error",
            true
        );
    }
    await ctx.api.deleteMessage(ctx.message?.chat.id, message.message_id);
});
