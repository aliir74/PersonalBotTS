import { getOAuth2Client, Email, sendEmail } from "../clients/google";
import {
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_REFRESH_TOKEN,
    GOOGLE_REDIRECT_URI,
    GOOGLE_EMAIL,
    GOOGLE_SUBJECT
} from "../environments";

import { getTasksByDueDate } from "../exports/notion";
import { NotionTask } from "../clients/notion";
import { updateTasksToAutomated } from "../imports/notion";

export async function notionToEmail() {
    const tasks: NotionTask[] = await getTasksByDueDate(new Date());
    const emailTasks = tasks.map((task) => {
        return {
            to: GOOGLE_EMAIL,
            subject: GOOGLE_SUBJECT,
            body:
                task.properties.taskName +
                " \n !" +
                task.properties.priority.toLowerCase()
        } as Email;
    });
    const oauth2Client = await getOAuth2Client(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REFRESH_TOKEN,
        GOOGLE_REDIRECT_URI
    );
    await Promise.all(
        emailTasks.map(async (task) => {
            await sendEmail(oauth2Client, task);
            console.log(`Email sent for task: ${task.body}`);
        })
    );
    console.log("All emails has been sent");
    console.log("Updating tasks to automated in Notion");
    await updateTasksToAutomated(tasks);
    console.log("Tasks updated to automated in Notion");
}
