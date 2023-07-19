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

impl Phoneme {
    /// Validates some desired properties for phonemes
    pub fn validated(self) -> Self {
        // Phones should not be duplicated
        let mut allophones = vec![];
        for allo in self.allo {
            if !allophones.contains(&allo) && allo != self.primary {
                allophones.push(allo);
            }
        }

        Self {
            allo: allophones,
            ..self
        }
    }
}

#[derive(Serialize, Deserialize, PartialEq, Eq, Copy, Clone, Debug)]
pub enum PlosivePlace {
    Bilabial,
    Labiodental,
    Dental,
    Alveolar,
}

#[derive(Serialize, Deserialize, PartialEq, Eq, Copy, Clone, Debug)]
pub enum FricativePlace {
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

#[derive(Serialize, Deserialize, PartialEq, Eq, Clone, Debug)]
pub enum Phone {
    Plosive {
        place: PlosivePlace,
        voiced: bool,
        attachments: HashSet<ObstruentAttachment>,
    },
    Affricative {
        start_place: PlosivePlace,
        end_place: FricativePlace,
        voiced: bool,
        attachments: HashSet<ObstruentAttachment>,
    },
    Fricative {
        place: FricativePlace,
        voiced: bool,
        attachments: HashSet<ObstruentAttachment>,
    },
    Vowel {},
    /// Null production
    Null,
}

impl Phone {
    fn get_plosive_base(
        place: &PlosivePlace,
        voiced: bool,
        attachments: &HashSet<ObstruentAttachment>,
    ) -> String {
        branner_to_ipa(match place {
            PlosivePlace::Bilabial if attachments.contains(&ObstruentAttachment::Ejective) => "p",
            PlosivePlace::Bilabial if voiced => "b",
            PlosivePlace::Bilabial => "p",
            PlosivePlace::Labiodental if attachments.contains(&ObstruentAttachment::Ejective) => {
                "p["
            }
            PlosivePlace::Labiodental if voiced => "b[",
            PlosivePlace::Labiodental => "p[",
            PlosivePlace::Dental if attachments.contains(&ObstruentAttachment::Ejective) => "t[",
            PlosivePlace::Dental if voiced => "d[",
            PlosivePlace::Dental => "t[",
            PlosivePlace::Alveolar if attachments.contains(&ObstruentAttachment::Ejective) => "t",
            PlosivePlace::Alveolar if voiced => "d",
            PlosivePlace::Alveolar => "t",
        })
    }

    fn get_fricative_base(
        place: &FricativePlace,
        voiced: bool,
        attachments: &HashSet<ObstruentAttachment>,
    ) -> String {
        branner_to_ipa(match place {
            FricativePlace::Bilabial if attachments.contains(&ObstruentAttachment::Ejective) => {
                "P\""
            }
            FricativePlace::Bilabial if voiced => "B\"",
            FricativePlace::Bilabial => "P\"",
            FricativePlace::Labiodental if attachments.contains(&ObstruentAttachment::Ejective) => {
                "f"
            }
            FricativePlace::Labiodental if voiced => "v",
            FricativePlace::Labiodental => "f",
            FricativePlace::Dental if attachments.contains(&ObstruentAttachment::Ejective) => "O-",
            FricativePlace::Dental if voiced => "d-",
            FricativePlace::Dental => "O-",
            FricativePlace::Alveolar if attachments.contains(&ObstruentAttachment::Ejective) => "s",
            FricativePlace::Alveolar if voiced => "z",
            FricativePlace::Alveolar => "s",
            FricativePlace::Postalveolar
                if attachments.contains(&ObstruentAttachment::Ejective) =>
            {
                "S"
            }
            FricativePlace::Postalveolar if voiced => "3\"",
            FricativePlace::Postalveolar => "S",
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
                let mut phone = Self::get_plosive_base(place, *voiced, attachments);

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
                let mut start_phone = Self::get_plosive_base(start_place, *voiced, attachments);
                let mut end_phone = Self::get_fricative_base(end_place, *voiced, attachments);

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
