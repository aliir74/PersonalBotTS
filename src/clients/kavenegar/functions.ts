import { kavenegarClient } from "./index";

export const sendSms = (receptor: string, message: string) => {
    return kavenegarClient.Send({
        message,
        receptor
    });
};
