import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

export const NOTION_INTEGRATION_TOKEN = process.env.NOTION_INTEGRATION_TOKEN;
export const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID ?? "";

export const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL ?? "";
