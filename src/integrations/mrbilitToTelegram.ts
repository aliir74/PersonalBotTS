import {
    filterTrains,
    getTrainSchedule,
    properTrainDataDisplay
} from "../clients/mrbilit/functions";
import { bot } from "../clients/telegram/bot";
import { TELEGRAM_GROUP_ID } from "../environments";
import { FilterTrain } from "../clients/mrbilit/types";
import { log } from "../clients/logger";
const INTEGRATION_LOG_PREFIX = "[MrBilit to Telegram]";
export async function mrbilitToTelegram(
    from: number,
    to: number,
    date: Date,
    adultCount: number,
    telegramChatId: number,
    filter?: FilterTrain
) {
    const trainSchedule = await getTrainSchedule({
        from: { code: from },
        to: { code: to },
        date: date,
        adultCount: adultCount
    });
    await log(
        `${trainSchedule.Trains.length} trains found for ${date.toISOString().split("T")[0]}`,
        "MrBilit to Telegram",
        "success"
    );
    if (filter) {
        const filteredTrains = filterTrains(trainSchedule.Trains, filter);
        await log(
            `${filteredTrains.length} filtered trains found for ${date.toISOString().split("T")[0]}`,
            "MrBilit to Telegram",
            "success"
        );
        if (filteredTrains.length > 0) {
            const message = filteredTrains
                .map((train) => properTrainDataDisplay(train))
                .join("\n\n");
            await bot.api.sendMessage(
                telegramChatId,
                `⚠⚠⚠\n\n${message}\n\n⚠⚠⚠`,
                { parse_mode: "MarkdownV2" }
            );
        }
    } else {
        const message = trainSchedule.Trains.map((train) =>
            properTrainDataDisplay(train)
        ).join("\n\n");
        await bot.api.sendMessage(
            telegramChatId,
            `🐈🐈🐈\n${message}\n🐈🐈🐈`,
            { parse_mode: "MarkdownV2" }
        );
    }
}
