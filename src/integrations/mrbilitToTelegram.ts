import { filterTrains, getTrainSchedule } from "../clients/mrbilit/functions";
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
            await bot.api.sendMessage(
                TELEGRAM_GROUP_ID,
                `⚠ Found ${filteredTrains.length} trains for ${date.toISOString().split("T")[0]} from ${getCityName(from)} to ${getCityName(to)}`
            );
        }
    } else {
        await bot.api.sendMessage(
            TELEGRAM_GROUP_ID,
            `Found ${trainSchedule.Trains.length} trains for ${date.toISOString().split("T")[0]} from ${getCityName(from)} to ${getCityName(to)}`
        );
    }
}
