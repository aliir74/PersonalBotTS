import { notionToEmail } from "./integrations/notionToEmail";
import { schedule } from "node-cron";
import { clickupToNotion } from "./integrations/clickupToNotion";
import { mrbilitToTelegram } from "./integrations/mrbilitToTelegram";
import { FilterTrain } from "./clients/mrbilit/types";
import { MY_TELEGRAM_USER_ID, TELEGRAM_GROUP_ID } from "./environments";
import { bot } from "./clients/telegram/bot";
// Every 15 minutes, between 08:00 AM and 11:59 PM, All days
schedule("*/15 8-23 * * *", async () => {
    await notionToEmail();
});

// Every 5 minutes, between 08:00 AM and 11:59 PM, Weekdays
schedule("*/5 8-23 * * 1-5", async () => {
    await clickupToNotion();
});

// Every 15 minutes, Check trains
schedule("*/15 * * * *", async () => {
    if (new Date() > new Date(Date.UTC(2024, 10, 8))) {
        return;
    }
    const filterTehranToShahrud: FilterTrain = {
        PassengerCount: 5,
        DepartureTime: {
            After: new Date(Date.UTC(2024, 10, 6, 14)),
            Before: new Date(Date.UTC(2024, 10, 6, 20))
        },
        BusInclude: false,
        CompartmentCapacityInclude: true
    };
    await mrbilitToTelegram(
        1,
        130,
        new Date(Date.UTC(2024, 10, 6)),
        5,
        filterTehranToShahrud
    );

    const filterShahrudToTehran: FilterTrain = {
        PassengerCount: 1,
        DepartureTime: {
            After: new Date(Date.UTC(2024, 10, 8, 16)),
            Before: new Date(Date.UTC(2024, 10, 8, 18))
        },
        BusInclude: false,
        CompartmentCapacityInclude: false
    };
    await mrbilitToTelegram(
        130,
        1,
        new Date(Date.UTC(2024, 10, 8)),
        1,
        filterShahrudToTehran
    );
});
// Every 15 minutes, Bot active check
schedule("0 0 * * *", async () => {
    await bot.api.sendMessage(MY_TELEGRAM_USER_ID, "Bot is active");
});

bot.command("status_trains", async (ctx) => {
    if (ctx.message?.chat.id !== TELEGRAM_GROUP_ID) {
        return;
    }
    await mrbilitToTelegram(1, 130, new Date(Date.UTC(2024, 10, 6)), 5);
    await mrbilitToTelegram(130, 1, new Date(Date.UTC(2024, 10, 8)), 1);
});
