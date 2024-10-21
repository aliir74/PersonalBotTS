const Kavenegar = require("kavenegar");

import { KAVENEGAR_API_KEY } from "../../environments";

export const kavenegarClient = Kavenegar.KavenegarApi({
    apikey: KAVENEGAR_API_KEY
});
