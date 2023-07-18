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

    fn provided_phonemes(&self) -> std::collections::HashSet<Uuid> {
        self.phonemes.keys().copied().collect()
    }

    fn phoneme_entry(&mut self, id: Uuid) -> std::collections::hash_map::Entry<Uuid, Phoneme> {
        self.phonemes.entry(id)
    }

    fn phoneme(&self, id: Uuid) -> Option<&Phoneme> {
        todo!()
    }

    fn phoneme_mut(&mut self, id: Uuid) -> Option<&mut Phoneme> {
        todo!()
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
