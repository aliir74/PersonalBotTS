import { getOAuth2Client, Email, sendEmail } from "../clients/google";
import {
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_REFRESH_TOKEN,
    GOOGLE_REDIRECT_URI,
    GOOGLE_EMAIL,
    GOOGLE_SUBJECT,
    MY_TELEGRAM_USER_ID
} from "../environments";
import { retryDecorator } from "ts-retry-promise";

import { getTasksByDueDate } from "../clients/notion/functions";
import { NotionTask } from "../clients/notion/types";
import { updateTasksToAutomated } from "../clients/notion/functions";
import { bot } from "../clients/telegram/bot";
import { log } from "../clients/logger";
import { DEFAULT_RETRY_CONFIG } from "../consts";
const INTEGRATION_LOG_PREFIX = "[Notion to Email]";

export async function notionToEmail(manualTrigger: boolean = false) {
    const tasks: NotionTask[] = await retryDecorator(
        getTasksByDueDate,
        DEFAULT_RETRY_CONFIG
    )(new Date());
    const emailTasks = tasks.map((task) => {
        return {
            to: GOOGLE_EMAIL,
            subject: GOOGLE_SUBJECT,
            body:
                task.properties.taskName +
                " \n !" +
                task.properties.priority?.toLowerCase()
        } as Email;
    });
    if (emailTasks.length === 0) {
        await log(
            `No tasks to send`,
            "Notion to Email",
            "success",
            manualTrigger
        );
        return;
    }
    const oauth2Client = await getOAuth2Client(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REFRESH_TOKEN,
        GOOGLE_REDIRECT_URI
    );
    await Promise.all(
        emailTasks.map(async (task) => {
            await sendEmail(oauth2Client, task);
            await log(
                `Email sent for task: ${task.body}`,
                "Notion to Email",
                "success"
            );
        })
    );
    await log(
        `${emailTasks.length} emails has been sent`,
        "Notion to Email",
        "success"
    );
    await log(
        `Updating tasks to automated in Notion`,
        "Notion to Email",
        "success"
    );
    await retryDecorator(updateTasksToAutomated, DEFAULT_RETRY_CONFIG)(tasks);
    await log(
        `${tasks.length} tasks updated to automated in Notion`,
        "Notion to Email",
        "success"
    );
    await log(
        `${tasks.length} tasks integrated with email`,
        "Notion to Email",
        "success",
        true
    );
}
