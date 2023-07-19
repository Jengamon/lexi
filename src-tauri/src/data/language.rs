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
    /// List of dialects, the first one is considered the "standard"
    /// and is the one that will be used for purposes of epoch-merge
    pub dialects: Option<Vec<String>>,
}

impl Default for Language {
    fn default() -> Self {
        Self {
            name: "unnamed".to_string(),
            phonemes: HashMap::new(),
            description: None,
            ancestors: vec![],
            dialects: None,
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

    fn phonemes(&self) -> &HashMap<Uuid, Phoneme> {
        &self.phonemes
    }

    fn phonemes_mut(&mut self) -> &mut HashMap<Uuid, Phoneme> {
        &mut self.phonemes
    }
}

impl Language {}
