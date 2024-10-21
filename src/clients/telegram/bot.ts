import { Bot } from "grammy";
import { TELEGRAM_BOT_TOKEN } from "../../environments";
export const bot = new Bot(TELEGRAM_BOT_TOKEN);

bot.start();
