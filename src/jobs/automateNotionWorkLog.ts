// This script is used to automate the Worklog Notion database.
import {
    WorklogNotionProperties,
    WorklogTaskStatus
} from "../clients/notion/worklog_dashboard/types";
import {
    convertNotionResponseToTask,
    NotionTask
} from "../clients/notion/types";
import { notionClient } from "../clients/notion";
import { NOTION_WORKLOG_DATABASE_ID } from "../environments";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { log } from "../clients/logger";
import {
    getDoneTasksWithoutCompletedMonth,
    setCompletedMonth
} from "../clients/notion/worklog_dashboard/functions";
export async function automateNotionWorkLog() {
    const tasks = await fetchTasks([
        WorklogTaskStatus.IN_PROGRESS,
        WorklogTaskStatus.NOT_STARTED,
        WorklogTaskStatus.BLOCKED
    ]);
    const notTodayTasks = await filterNotTodayTasks(tasks);
    await setDateToToday(notTodayTasks);
}

async function filterNotTodayTasks(tasks: NotionTask[]) {
    const today = new Date().toISOString().split("T")[0];
    const notTodayTasks = tasks.filter((task) => {
        const taskDate = (task.properties as WorklogNotionProperties).date;
        return taskDate !== today;
    });
    await log(
        `Got ${notTodayTasks.length} not today tasks from Notion`,
        "Automate Notion Worklog",
        "success"
    );
    return notTodayTasks;
}

async function fetchTasks(
    statusFilter: WorklogTaskStatus[]
): Promise<NotionTask[]> {
    const filters = statusFilter.map((status) => ({
        property: "Status",
        status: {
            equals: status
        }
    }));
    const tasks = await notionClient.databases.query({
        database_id: NOTION_WORKLOG_DATABASE_ID,
        filter: {
            or: filters
        }
    });
    await log(
        `Got ${tasks.results.length} tasks from Notion`,
        "Automate Notion Worklog",
        "success"
    );
    return Promise.all(
        tasks.results.map((task) =>
            convertNotionResponseToTask(task as DatabaseObjectResponse, false)
        )
    );
}

async function setDateToToday(tasks: NotionTask[]) {
    await Promise.all(
        tasks.map(async (task) => {
            await notionClient.pages.update({
                page_id: task.id,
                properties: {
                    Date: {
                        date: {
                            start: new Date().toISOString().split("T")[0]
                        }
                    }
                }
            });
            await notionClient.comments.create({
                parent: {
                    page_id: task.id
                },
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: `Set date to today at ${new Date().toLocaleString()}`
                        }
                    }
                ]
            });
        })
    );
    await log(
        `Set date to today for ${tasks.length} tasks`,
        "Automate Notion Worklog",
        "success"
    );
}

export async function setCompletedMonthForWorklogTasks() {
    const tasks = await getDoneTasksWithoutCompletedMonth();
    await log(
        `Found ${tasks.length} done tasks without completed month`,
        "Automate Notion Worklog",
        "success"
    );
    await Promise.all(tasks.map(setCompletedMonth));
    await log(
        "Set completed month for done tasks",
        "Automate Notion Worklog",
        "success"
    );
}
