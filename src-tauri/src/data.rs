use std::collections::HashSet;
use ipa_translate::branner_to_ipa;
use std::fmt;
use std::fmt::Formatter;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct LanguageGroup {
    pub version: String,
    pub protolangs: Vec<Protolanguage>,
    pub langs: Vec<Language>,
}

#[derive(Serialize, Deserialize)]
pub struct Protolanguage {
    pub name: String,
    pub phonemes: Vec<Phoneme>,
}

#[derive(Serialize, Deserialize)]
pub struct Language {
    pub name: String,
    pub phonemes: Vec<Phoneme>,
}

#[derive(Serialize, Deserialize)]
pub struct Phoneme {
    ortho: String,
    primary: Phone,
    allo: Vec<Phone>,
}

#[derive(Serialize, Deserialize)]
pub enum Place {
    Bilabial,
}

#[derive(Serialize, Deserialize, Hash, PartialEq, Eq)]
pub enum ObstruentAttachment {
    Preaspirated,
    Aspirated,
    Breathy,
    Creaky,
}

#[derive(Serialize, Deserialize)]
pub enum Phone {
    Plosive {
        place: Place,
        voiced: bool,
        attachments: HashSet<ObstruentAttachment>,
    },
    Affricative {
        start_place: Place,
        end_place: Place,
        voiced: bool,
        attachments: HashSet<ObstruentAttachment>,
    },
    Fricative {
        place: Place,
        voiced: bool,
        attachments: HashSet<ObstruentAttachment>,
    },
    Vowel {},
}

impl fmt::Display for Phone {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        let phone = match self {
            Phone::Plosive {place, voiced, attachments} =>  {
                let mut phone = match place {
                    Place::Bilabial if *voiced => "b".to_string(),
                    Place::Bilabial => "p".to_string()
                };

                if attachments.contains(&ObstruentAttachment::Preaspirated) {
                    phone = "hh".to_string() + &phone;
                } else if attachments.contains(&ObstruentAttachment::Aspirated) {
                    phone += "hh";
                }

                if attachments.contains(&ObstruentAttachment::Breathy) {
                    phone += "h\")";
                }

                if attachments.contains(&ObstruentAttachment::Creaky) {
                    phone += "~";
                }

                phone
            },
            Phone::Affricative { start_place, end_place, voiced, attachments } => todo!(),
            Phone::Fricative {place
            , voiced, attachments} => todo!(),
            Phone::Vowel {} => todo!()
        };

        write!(f, "{}", branner_to_ipa(&phone))
    }
}