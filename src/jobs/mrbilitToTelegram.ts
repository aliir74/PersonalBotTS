import {
    filterTrains,
    getTrainSchedule,
    properTrainDataDisplay
} from "../clients/mrbilit/functions";
import { TELEGRAM_GROUP_ID } from "../environments";
import { bot } from "../clients/telegram/bot";
import { City, FilterTrain } from "../clients/mrbilit/types";
import { log } from "../clients/logger";

export async function AbanEvent(manualTrigger: boolean = false) {
    const endTripDay = new Date(Date.UTC(2024, 10, 8));
    const endTripDayLastHour = new Date(
        endTripDay.getTime() + 20 * 60 * 60 * 1000
    );
    //Shahrud to Tehran
    const filterShahrudToTehran: FilterTrain = {
        PassengerCount: 1,
        DepartureTime: {
            After: endTripDay,
            Before: endTripDayLastHour
        },
        BusInclude: true,
        CompartmentCapacityInclude: false
    };
    try {
        await mrbilitToTelegram(
            City.Shahrud,
            City.Tehran,
            endTripDay,
            filterShahrudToTehran.PassengerCount,
            TELEGRAM_GROUP_ID,
            !manualTrigger ? filterShahrudToTehran : undefined
        );
    } catch (error) {
        await log(
            (error as Error).message,
            "Mrbilit to Telegram",
            "error",
            true
        );
    }

    // Mashhad to Tehran
    const filterMashhadToTehran: FilterTrain = {
        PassengerCount: 1,
        DepartureTime: {
            After: endTripDay,
            Before: endTripDayLastHour
        },
        BusInclude: true,
        CompartmentCapacityInclude: false
    };
    try {
        await mrbilitToTelegram(
            City.Mashhad,
            City.Tehran,
            endTripDay,
            filterMashhadToTehran.PassengerCount,
            TELEGRAM_GROUP_ID,
            !manualTrigger ? filterMashhadToTehran : undefined
        );
    } catch (error) {
        await log(
            (error as Error).message,
            "Mrbilit to Telegram",
            "error",
            true
        );
    }

    // Mashhad to Qom
    const filterMashhadToQom: FilterTrain = {
        PassengerCount: 1,
        DepartureTime: {
            After: endTripDay,
            Before: endTripDayLastHour
        },
        BusInclude: true,
        CompartmentCapacityInclude: false
    };
    try {
        await mrbilitToTelegram(
            City.Mashhad,
            City.QOM,
            endTripDay,
            filterMashhadToQom.PassengerCount,
            TELEGRAM_GROUP_ID,
            !manualTrigger ? filterMashhadToQom : undefined
        );
    } catch (error) {
        await log(
            (error as Error).message,
            "Mrbilit to Telegram",
            "error",
            true
        );
    }
}

export async function mrbilitToTelegram(
    from: number,
    to: number,
    date: Date,
    adultCount: number,
    telegramChatId: number,
    filter?: FilterTrain
) {
    const trainSchedule = await getTrainSchedule({
        from,
        to,
        date,
        adultCount
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
