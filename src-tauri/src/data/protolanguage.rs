use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::{BaseLanguage, Language, Phoneme};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Protolanguage {
    pub name: String,
    pub phonemes: HashMap<Uuid, Phoneme>,
    pub description: Option<serde_json::Value>,
}

impl Default for Protolanguage {
    fn default() -> Self {
        Self {
            name: "unnamed".to_string(),
            phonemes: HashMap::new(),
            description: None,
        }
    }
}

impl BaseLanguage for Protolanguage {
    fn name(&self) -> &str {
        &self.name
    }

    fn ancestors(&self) -> Vec<String> {
        vec![]
    }

    fn description(&self) -> Option<&serde_json::Value> {
        self.description.as_ref()
    }

    fn phonemes(&self) -> &HashMap<Uuid, Phoneme> {
        &self.phonemes
    }

    fn phonemes_mut(&mut self) -> &mut HashMap<Uuid, Phoneme> {
        &mut self.phonemes
    }
}

impl Protolanguage {}

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
