import axios from "axios";
import { MRBILIT_URL } from "../../environments";
import {
    PriceClass,
    Price,
    Train,
    TrainSchedule,
    TrainScheduleResponse,
    FilterTrain
} from "./types";

export async function getTrainSchedule(
    trainSchedule: TrainSchedule
): Promise<TrainScheduleResponse> {
    const query = new URLSearchParams({
        from: trainSchedule.from.code.toString(),
        to: trainSchedule.to.code.toString(),
        date: trainSchedule.date.toISOString().split("T")[0],
        adultCount: trainSchedule.adultCount.toString(),
        childCount: trainSchedule.childCount?.toString() ?? "0",
        infantCount: trainSchedule.infantCount?.toString() ?? "0",
        exclusive: trainSchedule.exclusive?.toString() ?? "true",
        availableStatus: trainSchedule.availableStatus ?? "Both",
        genderCode: trainSchedule.genderCode ?? "3"
    }).toString();
    const url = `${MRBILIT_URL}?${query}`;
    const response = await axios.get(url, {
        headers: {
            "Content-Type": "application/json"
        }
    });
    return response.data;
}
export function filterTrains(trains: Train[], filter: FilterTrain): Train[] {
    let filteredTrains = trains;
    if (!filter.BusInclude) {
        filteredTrains = filteredTrains.filter((train) =>
            train.Prices.some((price: Price) =>
                price.Classes.some((cls: PriceClass) => cls.IsCompartment)
            )
        );
    }
    if (filter.DepartureTime) {
        filteredTrains = filteredTrains.filter(
            (train) =>
                new Date(train.DepartureTime + "Z") >=
                    filter.DepartureTime.After &&
                new Date(train.DepartureTime + "Z") <=
                    filter.DepartureTime.Before
        );
    }
    if (filter.PassengerCount) {
        filteredTrains = filteredTrains.filter((train) =>
            train.Prices.some((price: Price) =>
                price.Classes.some(
                    (cls: PriceClass) => cls.Capacity >= filter.PassengerCount
                )
            )
        );
    }
    if (filter.CompartmentCapacityInclude) {
        filteredTrains = filteredTrains.filter((train) =>
            train.Prices.some((price: Price) =>
                price.Classes.some(
                    (cls: PriceClass) => cls.HasCompartmentCapacity
                )
            )
        );
    }

    return filteredTrains;
}

export function properTrainDataDisplay(train: Train) {
    const firstClass = train.Prices[0].Classes[0];
    const strikethroughStyle = firstClass.IsAvailable ? "" : "~";
    return `🚉${strikethroughStyle}${firstClass.WagonName}${strikethroughStyle}\n
    ${strikethroughStyle}*${train.FromName} به ${train.ToName}*${strikethroughStyle}\n 
    ${strikethroughStyle}${train.DepartureTime.split("T")[1]} ${"\\-"} ${train.ArrivalTime.split("T")[1]}${strikethroughStyle}\n 
    ${firstClass.IsAvailable ? `✅${firstClass.Capacity}` : "❌"}`;
}
