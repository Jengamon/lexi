// Keep in sync with definitions from the Tauri app
// TODO Figure out how to automate this?

import {Array, String, Record, Static} from "runtypes"

export const Protolanguage = Record({});
export const LanguageGroup = Record({
    version: String,
    protolangs: Array(Protolanguage),
});

export type Protolanguage = Static<typeof Protolanguage>;
export type LanguageGroup = Static<typeof LanguageGroup>;
