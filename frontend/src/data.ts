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
  Null,
} from "runtypes";

export const Place = Union(
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
    }),
  }),
  Record({
    Null: Null,
  }),
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

export type Place = Static<typeof Place>;
export type ObstruentAttachment = Static<typeof ObstruentAttachment>;
export type Phone = Static<typeof Phone>;
export type Phoneme = Static<typeof Phoneme>;
export type Protolanguage = Static<typeof Protolanguage>;
export type Language = Static<typeof Language>;
export type LanguageGroup = Static<typeof LanguageGroup>;
