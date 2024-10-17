import { NOTION_INTEGRATION_TOKEN } from "../../environments";

import { Client } from "@notionhq/client";

export const notionClient = new Client({
    auth: NOTION_INTEGRATION_TOKEN
});
