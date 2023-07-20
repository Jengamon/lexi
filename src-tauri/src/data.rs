mod language;
mod language_group;
mod phoneme;
mod phoneme_class;
mod protolanguage;

use std::collections::HashMap;

pub use language::*;
pub use language_group::*;
pub use phoneme::*;
pub use protolanguage::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize, Serialize)]
pub enum LanguageType {
    Protolanguage,
    Language,
}

pub(crate) trait BaseLanguage {
    fn ancestors(&self) -> Vec<String>;
    fn name(&self) -> &str;
    fn description(&self) -> Option<&serde_json::Value>;

    /// What phonemes does this language actually provide
    fn phonemes(&self) -> &HashMap<Uuid, Phoneme>;
    fn phonemes_mut(&mut self) -> &mut HashMap<Uuid, Phoneme>;
}
