import {
    getPersonalTasksByEmojiFilter,
    updateIcon
} from "../clients/notion/personal_dashboard/functions";
import { log } from "../clients/logger";

export async function updateDoneTasks(manualTrigger: boolean = false) {
    await log(
        "Updating done tasks emoji icon",
        "Automate Notion Personal Dashboard",
        "success",
        manualTrigger
    );
    const DONE_EMOJI = "✅";
    const tasks = await getPersonalTasksByEmojiFilter(DONE_EMOJI);
    await log(
        `Found ${tasks.length} done tasks for updating emoji icon`,
        "Automate Notion Personal Dashboard",
        "success",
        manualTrigger
    );
    await Promise.all(
        tasks.map(async (task) => {
            await updateIcon(task.id, DONE_EMOJI);
        })
    );
    await log(
        "Updated emoji icon for done tasks",
        "Automate Notion Personal Dashboard",
        "success",
        manualTrigger
    );
}
