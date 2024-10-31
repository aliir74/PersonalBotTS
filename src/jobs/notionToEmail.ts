import { getOAuth2Client, Email, sendEmail } from "../clients/google";
import {
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_REFRESH_TOKEN,
    GOOGLE_REDIRECT_URI,
    GOOGLE_EMAIL,
    GOOGLE_SUBJECT
} from "../environments";
import { retryDecorator } from "ts-retry-promise";

import { getPersonalTasksByDueDate } from "../clients/notion/personal_dashboard/functions";
import { AUTOMATED_PROPERTY } from "../clients/notion/personal_dashboard/types";
import { NotionTask } from "../clients/notion/types";
import { updateTasksToAutomated } from "../clients/notion/functions";
import { log } from "../clients/logger";
import { DEFAULT_RETRY_CONFIG } from "../consts";

export async function notionToEmail(manualTrigger: boolean = false) {
    const tasks: NotionTask[] = await retryDecorator(
        getPersonalTasksByDueDate,
        DEFAULT_RETRY_CONFIG
    )(new Date());
    const emailTasks = tasks.map((task) => {
        return {
            to: GOOGLE_EMAIL,
            subject: GOOGLE_SUBJECT,
            body: task.properties.name + " \n !" + task.properties.priority
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
    await retryDecorator(updateTasksToAutomated, DEFAULT_RETRY_CONFIG)(
        tasks,
        AUTOMATED_PROPERTY
    );
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
