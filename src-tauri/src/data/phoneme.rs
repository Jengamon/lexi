use core::fmt;
use std::{borrow::Cow, collections::HashSet, fmt::Formatter};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Phoneme {
    ortho: String,
    primary: Phone,
    allo: Vec<Phone>,
}

#[derive(Serialize, Deserialize, Copy, Clone)]
pub enum Place {
    Bilabial,
    Labiodental,
    Dental,
    Alveolar,
    Postalveolar,
}

#[derive(Serialize, Deserialize, Hash, PartialEq, Eq, Copy, Clone)]
pub enum ObstruentAttachment {
    Ejective,
    Preaspirated,
    Aspirated,
    Breathy,
    Creaky,
}

enum PhoneType {
    Plosive,
    Fricative,
    Vowel,
}

#[derive(Serialize, Deserialize, Clone)]
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

impl Phone {
    fn get_base(
        pt: PhoneType,
        place: &Place,
        voiced: bool,
        attachments: &HashSet<ObstruentAttachment>,
    ) -> String {
        match pt {
            PhoneType::Plosive => match place {
                Place::Bilabial if attachments.contains(&ObstruentAttachment::Ejective) => {
                    "p".to_string()
                }
                Place::Bilabial if voiced => "b".to_string(),
                Place::Bilabial => "p".to_string(),
                Place::Labiodental if attachments.contains(&ObstruentAttachment::Ejective) => {
                    "p[".to_string()
                }
                Place::Labiodental if voiced => "b[".to_string(),
                Place::Labiodental => "p[".to_string(),
                Place::Dental if attachments.contains(&ObstruentAttachment::Ejective) => {
                    "t[".to_string()
                }
                Place::Dental if voiced => "d[".to_string(),
                Place::Dental => "t[".to_string(),
                Place::Alveolar if attachments.contains(&ObstruentAttachment::Ejective) => {
                    "t".to_string()
                }
                Place::Alveolar if voiced => "d".to_string(),
                Place::Alveolar => "t".to_string(),
                Place::Postalveolar if attachments.contains(&ObstruentAttachment::Ejective) => {
                    "t".to_string()
                }
                Place::Postalveolar if voiced => "d".to_string(),
                Place::Postalveolar => "t".to_string(),
            },
            PhoneType::Fricative => match place {
                Place::Bilabial if attachments.contains(&ObstruentAttachment::Ejective) => {
                    "P\"".to_string()
                }
                Place::Bilabial if voiced => "B\"".to_string(),
                Place::Bilabial => "P\"".to_string(),
                Place::Labiodental if attachments.contains(&ObstruentAttachment::Ejective) => {
                    "f".to_string()
                }
                Place::Labiodental if voiced => "v".to_string(),
                Place::Labiodental => "f".to_string(),
                Place::Dental if attachments.contains(&ObstruentAttachment::Ejective) => {
                    "O-".to_string()
                }
                Place::Dental if voiced => "d-".to_string(),
                Place::Dental => "O-".to_string(),
                Place::Alveolar if attachments.contains(&ObstruentAttachment::Ejective) => {
                    "s".to_string()
                }
                Place::Alveolar if voiced => "z".to_string(),
                Place::Alveolar => "s".to_string(),
                Place::Postalveolar if attachments.contains(&ObstruentAttachment::Ejective) => {
                    "S".to_string()
                }
                Place::Postalveolar if voiced => "3\"".to_string(),
                Place::Postalveolar => "S".to_string(),
            },
            PhoneType::Vowel => todo!(),
        }
    }

    fn aspiration<'a>(phone: &'a str, attachments: &HashSet<ObstruentAttachment>) -> Cow<'a, str> {
        if attachments.contains(&ObstruentAttachment::Preaspirated) {
            Cow::Owned("h^".to_string() + phone)
        } else if attachments.contains(&ObstruentAttachment::Aspirated) {
            Cow::Owned(phone.to_string() + "h^")
        } else {
            Cow::Borrowed(phone)
        }
    }
}

impl fmt::Display for Phone {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        let phone = match self {
            Phone::Plosive {
                place,
                voiced,
                attachments,
            } => {
                let mut phone = Self::get_base(PhoneType::Plosive, place, *voiced, attachments);

                if attachments.contains(&ObstruentAttachment::Breathy) {
                    phone += r#"h")"#;
                }

                if attachments.contains(&ObstruentAttachment::Creaky) {
                    phone += "~";
                }

                if attachments.contains(&ObstruentAttachment::Ejective) {
                    phone += "`";
                }

                phone = Self::aspiration(&phone, attachments).to_string();

                phone
            }
            Phone::Affricative {
                start_place,
                end_place,
                voiced,
                attachments,
            } => {
                let mut start_phone =
                    Self::get_base(PhoneType::Plosive, start_place, *voiced, attachments);
                let mut end_phone =
                    Self::get_base(PhoneType::Fricative, end_place, *voiced, attachments);

                if attachments.contains(&ObstruentAttachment::Breathy) {
                    start_phone += r#"h")"#;
                    end_phone += r#"h")"#;
                }

                if attachments.contains(&ObstruentAttachment::Creaky) {
                    start_phone += "~\u{200b}";
                    end_phone += "~\u{200b}";
                }

                let mut phone = format!("{start_phone})){end_phone}");

                if attachments.contains(&ObstruentAttachment::Ejective) {
                    phone += "`";
                }

                phone = Self::aspiration(&phone, attachments).to_string();

                phone
            }
            Phone::Fricative {
                place: _,
                voiced: _,
                attachments: _,
            } => todo!(),
            Phone::Vowel {} => todo!(),
        };

        write!(f, "{}", phone)
    }
}
