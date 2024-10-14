import { MAKE_WEBHOOK_URL } from "../environments";
import { getTasksByDueDate, NotionTask } from "../exports/notion";
import { sendRequest, MakeTask, convertToMakePriority } from "../imports/make";

export async function notionToMake() {
    const tasks: NotionTask[] = await getTasksByDueDate(new Date());
    const makeTasks = tasks.map((task) => {
        return {
            name: task.properties.taskName,
            dueDate: task.properties.due,
            priority: convertToMakePriority(task.properties.priority)
        } as MakeTask;
    });
    const response = await sendRequest(MAKE_WEBHOOK_URL, "POST", makeTasks);
    console.log("Response from Make", response);
}
