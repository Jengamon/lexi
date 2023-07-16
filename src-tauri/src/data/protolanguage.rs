use serde::{Deserialize, Serialize};

use super::{Language, Phoneme};

#[derive(Serialize, Deserialize, Clone)]
pub struct Protolanguage {
    pub name: String,
    pub phonemes: Vec<Phoneme>,
    pub description: Option<serde_json::Value>,
}

impl Default for Protolanguage {
    fn default() -> Self {
        Self {
            name: "unnamed".to_string(),
            phonemes: vec![],
            description: None,
        }
    }
}

impl Protolanguage {
    pub fn description(&self) -> Option<&serde_json::Value> {
        self.description.as_ref()
    }
}

/// Important for "epochs", as languages can only have an "ancestry"
/// of protolanguages (for now, or maybe ever)
impl From<Language> for Protolanguage {
    fn from(value: Language) -> Self {
        Self {
            name: value.name,
            phonemes: value.phonemes,
            description: value.description,
        }
    }
}
