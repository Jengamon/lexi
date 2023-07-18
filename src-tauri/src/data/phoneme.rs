use core::fmt;
use std::{borrow::Cow, collections::HashSet, fmt::Formatter};

use ipa_translate::branner_to_ipa;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Phoneme {
    pub ortho: String,
    pub primary: Phone,
    pub allo: Vec<Phone>,
}

impl Default for Phoneme {
    fn default() -> Self {
        Self {
            ortho: "".to_string(),
            primary: Phone::Null,
            allo: vec![],
        }
    }
}

#[derive(Serialize, Deserialize, Copy, Clone, Debug)]
pub enum Place {
    Bilabial,
    Labiodental,
    Dental,
    Alveolar,
    Postalveolar,
}

#[derive(Serialize, Deserialize, Hash, PartialEq, Eq, Copy, Clone, Debug)]
pub enum ObstruentAttachment {
    Ejective,
    Preaspirated,
    Aspirated,
    Breathy,
    Creaky,
}

enum ConsPhoneBase {
    Plosive,
    Fricative,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
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
    /// Null production
    Null,
}

impl Phone {
    fn get_cons_base(
        pt: ConsPhoneBase,
        place: &Place,
        voiced: bool,
        attachments: &HashSet<ObstruentAttachment>,
    ) -> String {
        branner_to_ipa(match pt {
            ConsPhoneBase::Plosive => match place {
                Place::Bilabial if attachments.contains(&ObstruentAttachment::Ejective) => "p",
                Place::Bilabial if voiced => "b",
                Place::Bilabial => "p",
                Place::Labiodental if attachments.contains(&ObstruentAttachment::Ejective) => "p[",
                Place::Labiodental if voiced => "b[",
                Place::Labiodental => "p[",
                Place::Dental if attachments.contains(&ObstruentAttachment::Ejective) => "t[",
                Place::Dental if voiced => "d[",
                Place::Dental => "t[",
                Place::Alveolar if attachments.contains(&ObstruentAttachment::Ejective) => "t",
                Place::Alveolar if voiced => "d",
                Place::Alveolar => "t",
                Place::Postalveolar if attachments.contains(&ObstruentAttachment::Ejective) => "t",
                Place::Postalveolar if voiced => "d",
                Place::Postalveolar => "t",
            },
            ConsPhoneBase::Fricative => match place {
                Place::Bilabial if attachments.contains(&ObstruentAttachment::Ejective) => "P\"",
                Place::Bilabial if voiced => "B\"",
                Place::Bilabial => "P\"",
                Place::Labiodental if attachments.contains(&ObstruentAttachment::Ejective) => "f",
                Place::Labiodental if voiced => "v",
                Place::Labiodental => "f",
                Place::Dental if attachments.contains(&ObstruentAttachment::Ejective) => "O-",
                Place::Dental if voiced => "d-",
                Place::Dental => "O-",
                Place::Alveolar if attachments.contains(&ObstruentAttachment::Ejective) => "s",
                Place::Alveolar if voiced => "z",
                Place::Alveolar => "s",
                Place::Postalveolar if attachments.contains(&ObstruentAttachment::Ejective) => "S",
                Place::Postalveolar if voiced => "3\"",
                Place::Postalveolar => "S",
            },
        })
    }

    fn aspiration<'a>(phone: &'a str, attachments: &HashSet<ObstruentAttachment>) -> Cow<'a, str> {
        if attachments.contains(&ObstruentAttachment::Preaspirated) {
            Cow::Owned(branner_to_ipa("h^") + phone)
        } else if attachments.contains(&ObstruentAttachment::Aspirated) {
            Cow::Owned(phone.to_string() + &branner_to_ipa("h^"))
        } else {
            Cow::Borrowed(phone)
        }
    }
}

impl fmt::Display for Phone {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        let phone = match self {
            Phone::Null => "∅".to_string(),
            Phone::Plosive {
                place,
                voiced,
                attachments,
            } => {
                let mut phone =
                    Self::get_cons_base(ConsPhoneBase::Plosive, place, *voiced, attachments);

                if attachments.contains(&ObstruentAttachment::Breathy) {
                    phone += &branner_to_ipa(r#"h")"#);
                }

                if attachments.contains(&ObstruentAttachment::Creaky) {
                    phone += &branner_to_ipa("~");
                }

                if attachments.contains(&ObstruentAttachment::Ejective) {
                    phone += &branner_to_ipa("`");
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
                    Self::get_cons_base(ConsPhoneBase::Plosive, start_place, *voiced, attachments);
                let mut end_phone =
                    Self::get_cons_base(ConsPhoneBase::Fricative, end_place, *voiced, attachments);

                if attachments.contains(&ObstruentAttachment::Breathy) {
                    start_phone += &branner_to_ipa(r#"h")"#);
                    end_phone += &branner_to_ipa(r#"h")"#);
                }

                if attachments.contains(&ObstruentAttachment::Creaky) {
                    start_phone += &branner_to_ipa("~");
                    end_phone += &branner_to_ipa("~");
                }

                let mut phone = branner_to_ipa(&format!("{start_phone})){end_phone}"));

                if attachments.contains(&ObstruentAttachment::Ejective) {
                    phone += &branner_to_ipa("`");
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
