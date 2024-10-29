import axios from "axios";
import {
    CLICKUP_API_KEY,
    CLICKUP_LIST_ID,
    CLICKUP_USER_ID
} from "../../environments";
import { ClickUpResponse, ClickUpTask } from "./types";

export async function getMyTasksFromClickUp(
    listId: number = CLICKUP_LIST_ID,
    userId: number = CLICKUP_USER_ID
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
                    Authorization: CLICKUP_API_KEY
                }
            }
        );
        lastPage = response.data.last_page;
        page++;
        allTasks = [...allTasks, ...response.data.tasks];
    }
    return allTasks;
}
