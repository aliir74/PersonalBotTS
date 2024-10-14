import { MAKE_WEBHOOK_URL } from "../environments";

import axios from "axios";

export type MakeTask = {
    name: string;
    dueDate: string;
    priority: MakePriority;
};

export enum MakePriority {
    HIGH = 9,
    MEDIUM = 5,
    LOW = 1
}

export function convertToMakePriority(priority: string): MakePriority {
    switch (priority) {
        case "High":
            return MakePriority.HIGH;
        case "Medium":
            return MakePriority.MEDIUM;
        case "Low":
            return MakePriority.LOW;
        default:
            return MakePriority.LOW;
    }
}

export async function sendRequest(
    url: string,
    method: string,
    data: MakeTask[]
) {
    console.log("Sending request to Make");
    const response = await axios({
        url: url || MAKE_WEBHOOK_URL,
        method: method || "POST",
        data
    });
    return response.data;
}
