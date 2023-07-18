mod language;
mod language_group;
mod phoneme;
mod protolanguage;

use std::collections::HashSet;

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
    fn provided_phonemes(&self) -> HashSet<Uuid>;
    fn phoneme_entry(&mut self, id: Uuid) -> std::collections::hash_map::Entry<Uuid, Phoneme>;
    fn phoneme(&self, id: Uuid) -> Option<&Phoneme>;
    fn phoneme_mut(&mut self, id: Uuid) -> Option<&mut Phoneme>;
}
