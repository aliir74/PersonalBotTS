import { notionClient } from "./index";
import { NotionTask } from "./types";

export async function updateTasksToAutomated(
    tasks: NotionTask[],
    property: string
) {
    await Promise.all(
        tasks.map(async (task) => {
            await notionClient.pages.update({
                page_id: task.id || "",
                properties: {
                    [property]: {
                        checkbox: true
                    }
                }
            });
        })
    );
}
