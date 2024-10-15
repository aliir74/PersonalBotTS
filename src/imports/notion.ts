import { notionClient, NotionTask } from "../clients/notion";

export async function updateTasksToAutomated(tasks: NotionTask[]) {
    await Promise.all(
        tasks.map(async (task) => {
            await notionClient.pages.update({
                page_id: task.id,
                properties: {
                    Automated: {
                        checkbox: true
                    }
                }
            });
        })
    );
}
