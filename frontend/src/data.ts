// Keep in sync with definitions from the Tauri app's data.rs
// TODO Figure out how to automate this?

import {
    Array,
    String,
    Record,
    Static,
    Union,
    Literal,
    Boolean,
} from "runtypes";

export const Place = Union(
    Literal("Bilabial"),
    Literal("Dental"),
    Literal("Alveolar"),
);
export const ObstruentAttachment = Union(
    Literal("Ejective"),
    Literal("Preaspirated"),
    Literal("Aspirated"),
    Literal("Breathy"),
    Literal("Creaky"),
);
export const Phone = Union(
    Record({
        Plosive: Record({
            place: Place,
            voiced: Boolean,
            attachments: Array(ObstruentAttachment),
        }),
    }),
    Record({
        Affricative: Record({
            start_place: Place,
            end_place: Place,
            voiced: Boolean,
            attachments: Array(ObstruentAttachment),
        })
    })
);
export const Phoneme = Record({
    ortho: String,
    primary: Phone,
    allo: Array(Phone),
});
export const Language = Record({
    name: String,
    phonemes: Array(Phoneme),
});
export const Protolanguage = Record({
    name: String,
    phonemes: Array(Phoneme),
});
export const LanguageGroup = Record({
    version: String,
    protolangs: Array(Protolanguage),
    langs: Array(Language),
});

export type Place = Static<typeof Place>;
export type ObstruentAttachment = Static<typeof ObstruentAttachment>;
export type Phone = Static<typeof Phone>;
export type Phoneme = Static<typeof Phoneme>;
export type Protolanguage = Static<typeof Protolanguage>;
export type Language = Static<typeof Language>;
export type LanguageGroup = Static<typeof LanguageGroup>;
