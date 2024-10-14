import { MAKE_WEBHOOK_URL } from "../environments";

import axios from "axios";

export type MakeTask = {
    name: string;
    dueDate: string;
    priority: string;
};

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
