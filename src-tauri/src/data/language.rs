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
    /// List of dialects
    pub dialects: Option<HashMap<String, ()>>,
    /// "Standard" dialect for the purpose of epoch,
    /// if unset, the absence of dialect information is "standard".
    pub standard_dialect: Option<String>,
}

impl Default for Language {
    fn default() -> Self {
        Self {
            name: "unnamed".to_string(),
            phonemes: HashMap::new(),
            description: None,
            ancestors: vec![],
            dialects: None,
            standard_dialect: None,
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
