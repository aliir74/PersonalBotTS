import { Bot } from "grammy";
import { TELEGRAM_BOT_TOKEN, MY_TELEGRAM_USER_ID } from "../../environments";
export const bot = new Bot(TELEGRAM_BOT_TOKEN);

bot.start();

bot.api.sendMessage(MY_TELEGRAM_USER_ID, `✅ Code is deployed successfully!`);
