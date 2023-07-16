use serde::{Deserialize, Serialize};

use super::Phoneme;

#[derive(Serialize, Deserialize, Clone)]
pub struct Language {
    /// Uniquely identifies this language
    ///
    /// Immutable once a language has been created.
    pub name: String,
    pub phonemes: Vec<Phoneme>,
    /// General information about the language
    ///
    /// Technically can be any JSON-able object
    pub description: Option<serde_json::Value>,
}

impl Default for Language {
    fn default() -> Self {
        Self {
            name: "unnamed".to_string(),
            phonemes: vec![],
            description: None,
        }
    }
}

impl Language {
    pub fn description(&self) -> Option<&serde_json::Value> {
        self.description.as_ref()
    }
}
