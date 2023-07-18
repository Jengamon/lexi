use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::{BaseLanguage, Phoneme};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Language {
    /// Uniquely identifies this language
    ///
    /// Immutable once a language has been created.
    pub name: String,
    pub phonemes: HashMap<Uuid, Phoneme>,
    /// General information about the language
    ///
    /// Technically can be any JSON-able object
    pub description: Option<serde_json::Value>,
    /// Protolanguage names that this language is descended from
    pub ancestors: Vec<String>,
}

impl Default for Language {
    fn default() -> Self {
        Self {
            name: "unnamed".to_string(),
            phonemes: HashMap::new(),
            description: None,
            ancestors: vec![],
        }
    }
}

impl BaseLanguage for Language {
    fn name(&self) -> &str {
        &self.name
    }

    fn ancestors(&self) -> Vec<String> {
        self.ancestors.clone()
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

impl Language {}
