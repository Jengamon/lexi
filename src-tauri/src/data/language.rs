use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::Phoneme;

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

impl Language {
    pub fn description(&self) -> Option<&serde_json::Value> {
        self.description.as_ref()
    }
}
