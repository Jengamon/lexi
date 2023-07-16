use serde::{Deserialize, Serialize};

use super::Phoneme;

#[derive(Serialize, Deserialize, Clone)]
pub struct Language {
    pub name: String,
    pub phonemes: Vec<Phoneme>,
}

impl Default for Language {
    fn default() -> Self {
        Self {
            name: "unnamed".to_string(),
            phonemes: vec![],
        }
    }
}
