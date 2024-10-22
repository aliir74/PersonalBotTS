import {
    filterTrains,
    getTrainSchedule,
    properTrainDataDisplay
} from "../clients/mrbilit/functions";
import { bot } from "../clients/telegram/bot";
import { TELEGRAM_GROUP_ID } from "../environments";
import { FilterTrain, getCityName } from "../clients/mrbilit/types";

const INTEGRATION_LOG_PREFIX = "[MrBilit to Telegram]";
export async function mrbilitToTelegram(
    from: number,
    to: number,
    date: Date,
    adultCount: number,
    filter?: FilterTrain
) {
    const trainSchedule = await getTrainSchedule({
        from: { code: from },
        to: { code: to },
        date: date,
        adultCount: adultCount
    });
    console.log(
        `${INTEGRATION_LOG_PREFIX} ${trainSchedule.Trains.length} trains found for ${date.toISOString().split("T")[0]}`
    );
    if (filter) {
        const filteredTrains = filterTrains(trainSchedule.Trains, filter);
        console.log(
            `${INTEGRATION_LOG_PREFIX} ${filteredTrains.length} filtered trains found for ${date.toISOString().split("T")[0]}`
        );
        if (filteredTrains.length > 0) {
            const message = filteredTrains
                .map((train) => properTrainDataDisplay(train))
                .join("\n\r");
            await bot.api.sendMessage(
                TELEGRAM_GROUP_ID,
                `⚠⚠⚠\n\n${message}\n\n⚠⚠⚠`
            );
        }
    } else {
        const message = trainSchedule.Trains.map((train) =>
            properTrainDataDisplay(train)
        ).join("\n\r");
        await bot.api.sendMessage(
            TELEGRAM_GROUP_ID,
            `🐈🐈🐈\n${message}\n🐈🐈🐈`
        );
    }
}
