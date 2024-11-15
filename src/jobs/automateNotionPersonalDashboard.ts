import {
    getPersonalTasksByProjectNameFilter,
    updateTaskName
} from "../clients/notion/personal_dashboard/functions";
import { log } from "../clients/logger";

export async function updateDoneTasks(manualTrigger: boolean = false) {
    await log(
        "Updating done tasks name",
        "automateNotionPersonalDashboard",
        "success",
        manualTrigger
    );
    const DONE_CHARACTER = "✅";
    const tasks = await getPersonalTasksByProjectNameFilter(DONE_CHARACTER);
    await log(
        `Found ${tasks.length} done tasks for update`,
        "automateNotionPersonalDashboard",
        "success",
        manualTrigger
    );
    await Promise.all(
        tasks.map(async (task) => {
            await updateTaskName(
                task.id,
                DONE_CHARACTER + task.properties.name
            );
        })
    );
    await log(
        "Done tasks name updated",
        "automateNotionPersonalDashboard",
        "success",
        manualTrigger
    );
}
