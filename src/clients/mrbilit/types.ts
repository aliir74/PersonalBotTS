export type TrainSchedule = {
    from: City;
    to: City;
    date: Date;
    adultCount: number;
    childCount?: number;
    infantCount?: number;
    exclusive?: boolean;
    availableStatus?: "Both" | "OnlyMale" | "OnlyFemale";
    genderCode?: "1" | "2" | "3";
};

export enum City {
    Tehran = 1,
    Shahrud = 130,
    Mashhad = 191
}

export type Corporation = {
    ID: number;
    Ids: number[];
    Name: string;
};

export type WagonType = {
    ID: number;
    Name: string;
};

export type Location = {
    Latitude: number;
    Longitude: number;
    Title: string;
};

export type PriceClass = {
    ID: number;
    Capacity: number;
    CompartmentCapacity: number;
    HasCompartmentCapacity: number;
    IsAvailable: boolean;
    IsCompartment: boolean;
    Price: number;
    WagonName: string;
    WagonID: number;
};

export type Price = {
    SellType: number;
    Classes: PriceClass[];
};

export type Train = {
    ArrivalDateString: string;
    ArrivalTime: string;
    Cancellable: boolean;
    CorporationID: number;
    CorporationIds: number[];
    CorporationName: string;
    DateString: string;
    DepartureTime: string;
    From: City;
    FromCache: boolean;
    FromName: string;
    ID: number;
    IsForeign: boolean;
    Prices: Price[];
    To: City;
    ToCache: boolean;
    ToName: string;
    Weekday: string;
    Provider: number;
    ProviderName: string;
    Score: number | null;
    TrainNumber: string;
};

export type TrainScheduleResponse = {
    ContentPath: string;
    Filters: {
        Corporations: Corporation[];
        MaxPrice: number;
        MinPrice: number;
        WagonTypes: WagonType[];
    };
    FromLocation: Location;
    ToLocation: Location;
    TrainPackages: any[];
    Trains: Train[];
};

export type FilterTrain = {
    DepartureTime: {
        Before: Date;
        After: Date;
    };
    BusInclude: boolean;
    PassengerCount: number;
    CompartmentCapacityInclude: boolean;
};
