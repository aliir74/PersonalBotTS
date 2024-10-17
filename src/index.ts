import { notionToEmail } from "./integrations/notionToEmail";
import { schedule } from "node-cron";
import { clickupToNotion } from "./integrations/clickupToNotion";

// Every 15 minutes, between 08:00 AM and 11:59 PM, All days
schedule("*/15 8-23 * * *", () => {
    notionToEmail();
});

// Every 5 minutes, between 08:00 AM and 11:59 PM, Weekdays
schedule("*/5 8-23 * * 1-5", () => {
    clickupToNotion();
});
