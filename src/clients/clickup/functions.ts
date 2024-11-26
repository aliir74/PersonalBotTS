import axios from "axios";
import { ClickUpResponse, ClickUpTask } from "./types";
import { log } from "../logger";

export async function getMyTasksFromClickUp(
    listId: number,
    userId: number,
    apiKey: string
): Promise<ClickUpTask[]> {
    let allTasks: ClickUpTask[] = [];
    let lastPage = false;
    let page = 0;
    while (!lastPage) {
        const query = new URLSearchParams({
            archived: "false",
            page: page.toString(),
            include_closed: "false",
            subtasks: "true",
            "assignees[]": userId.toString()
        }).toString();
        const response = await axios.get<ClickUpResponse>(
            `https://api.clickup.com/api/v2/list/${listId}/task?${query}`,
            {
                headers: {
                    Authorization: apiKey
                }
            }
        );
        lastPage = response.data.last_page;
        page++;
        allTasks = [...allTasks, ...response.data.tasks];
    }
    await log(
        `${allTasks.length} tasks from ClickUp`,
        "Get ClickUp tasks",
        "success"
    );
    return allTasks;
}
