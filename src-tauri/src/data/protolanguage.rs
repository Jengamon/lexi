use serde::{Deserialize, Serialize};

use super::Phoneme;

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

    pub fn description_mut(&mut self) -> Option<&mut serde_json::Value> {
        self.description.as_mut()
    }
}
