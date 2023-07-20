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
    Unknown,
    Dictionary,
} from "runtypes";

export const PlosivePlace = Union(
    Literal("Bilabial"),
    Literal("Labiodental"),
    Literal("Dental"),
    Literal("Alveolar"),
);
export const FricativePlace = Union(
    Literal("Bilabial"),
    Literal("Labiodental"),
    Literal("Dental"),
    Literal("Alveolar"),
    Literal("Postalveolar"),
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
            place: PlosivePlace,
            voiced: Boolean,
            attachments: Array(ObstruentAttachment),
        }),
    }),
    Record({
        Affricative: Record({
            start_place: PlosivePlace,
            end_place: FricativePlace,
            voiced: Boolean,
            attachments: Array(ObstruentAttachment),
        }),
    }),
    Literal("Null"),
);
export const Phoneme = Record({
    ortho: String,
    primary: Phone,
    allo: Array(Phone),
});
export const Language = Record({
    name: String,
    description: Unknown.optional(),
    phonemes: Dictionary(Phoneme, String),
    ancestors: Array(String),
});
export const Protolanguage = Record({
    name: String,
    description: Unknown.optional(),
    phonemes: Dictionary(Phoneme, String),
});
export const LanguageGroup = Record({
    version: String,
    protolangs: Array(Protolanguage),
    langs: Array(Language),
});

export type PlosivePlace = Static<typeof PlosivePlace>;
export type FricativePlace = Static<typeof FricativePlace>;
export type ObstruentAttachment = Static<typeof ObstruentAttachment>;
export type Phone = Static<typeof Phone>;
export type Phoneme = Static<typeof Phoneme>;
export type Protolanguage = Static<typeof Protolanguage>;
export type Language = Static<typeof Language>;
export type LanguageGroup = Static<typeof LanguageGroup>;
