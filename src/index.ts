import { notionToEmail } from "./integrations/notionToEmail";
import { schedule } from "node-cron";

schedule("* * * * *", () => {
    notionToEmail();
});
