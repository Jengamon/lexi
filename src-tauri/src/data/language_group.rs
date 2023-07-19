#[cfg(test)]
mod tests;

use std::collections::{HashMap, HashSet};

use semver::Version;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::{BaseLanguage, Language, Phoneme, Protolanguage};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LanguageGroup {
    pub version: Version,
    /// Identifies the same "family" of language groups
    ///
    /// All language groups that are related to each other have the same value
    pub family_id: Uuid,
    pub protolangs: Vec<Protolanguage>,
    pub langs: Vec<Language>,
}

#[derive(Debug, thiserror::Error)]
pub enum LanguageGroupError {
    #[error("cannot create a language with a blank name")]
    LanguageEmptyName,
    #[error("the language named {0} already exists")]
    LanguageExists(String),
    #[error("cannot create a proto-language with a blank name")]
    ProtolanguageEmptyName,
    #[error("the proto-language named {0} already exists")]
    ProtolanguageExists(String),
}

// Use the crate version as the data version of the language group

// Since we use semver, we can just bake in our semver compatibility for data.
const CRATE_VERSION: &str = env!("CARGO_PKG_VERSION");

impl Default for LanguageGroup {
    fn default() -> Self {
        Self {
            version: Version::parse(CRATE_VERSION).unwrap(),
            family_id: Uuid::new_v4(),
            protolangs: vec![],
            langs: vec![],
        }
    }
}

// Adding and removing phonemes from a (proto-)language
impl LanguageGroup {
    /// Setting a phoneme
    ///
    /// The given id must either match an id in the language itself,
    /// or the id must be present in one of the languages's protolanguages.
    ///
    /// Returns success
    pub(crate) fn set_phoneme(
        protolangs: &Vec<Protolanguage>,
        lang: &mut dyn BaseLanguage,
        id: Uuid,
        phon: Phoneme,
    ) -> bool {
        if let Some(phon_slot) = lang.phonemes_mut().get_mut(&id) {
            *phon_slot = phon;
            true
        } else {
            for anc in lang.ancestors() {
                if let Some(proto) = protolangs.iter().find(|lang| lang.name() == anc) {
                    let provided_phonemes: HashSet<_> = proto.phonemes().keys().collect();
                    if provided_phonemes.contains(&id) {
                        *lang.phonemes_mut().entry(id).or_default() = phon;
                        return true;
                    }
                } else {
                    log::error!("Invalid ancestor in {}: {}", lang.name(), anc);
                }
            }
            false
        }
    }

    /// Getting a phoneme
    ///
    /// The given id must either match an id in the language itself,
    /// or be present in one of the languages's protolanguages.
    pub(crate) fn get_phoneme<'a>(
        protolangs: &'a Vec<Protolanguage>,
        lang: &'a dyn BaseLanguage,
        id: Uuid,
    ) -> Option<&'a Phoneme> {
        if let Some(phon) = lang.phonemes().get(&id) {
            Some(phon)
        } else {
            lang.ancestors()
                .iter()
                .filter_map(|anc| {
                    protolangs
                        .iter()
                        .find(|lang| lang.name() == anc && lang.phonemes().keys().any(|k| k == &id))
                })
                .find_map(|proto| proto.phonemes.get(&id))
        }
    }
}

// General changes (epoching & merging)
impl LanguageGroup {
    /// Creates a new epoch.
    ///
    /// All protolanguages are lost, and languages become protolanguages.
    /// All protolanguage base info (phonemes and morphemes) are merged into the necessary languages
    /// before it becomes a protolanguage
    pub fn epoch(&mut self) {
        // Create language phoneme lists
        let phonemes: Vec<HashMap<_, _>> = self
            .langs
            .iter()
            .map(|l| {
                l.ancestors
                    .iter()
                    .flat_map(|anc| {
                        self.protolanguage(anc)
                            .unwrap()
                            .phonemes
                            .iter()
                            .map(|(k, v)| (*k, v.clone()))
                    })
                    .collect()
            })
            .collect();
        self.protolangs.clear();
        self.protolangs = self
            .langs
            .drain(..)
            .zip(phonemes)
            .map(|(l, phons)| {
                let mut basic: Protolanguage = l.into();
                // Order matters: if both protolanguage and language specify
                // an id for a phoneme, we want to use the one in the language
                // (a language can "override" a protolanguage's phonemes)
                // This is how we implement sound change.
                basic.phonemes = phons
                    .into_iter()
                    .chain(basic.phonemes.into_iter())
                    .collect();
                basic
            })
            .collect();
    }

    /// Merges in languages of a language group.
    ///
    /// Loads only languages from an input language group, removing data that references
    /// something that isn't provided by the protolanguages in existence.
    ///
    /// ### Warning
    /// This should only be called if the input language group shares
    /// the family id with this language group. Also, is lossy in that
    /// a merge will *replace* the languages that exist.
    pub fn merge(&mut self, langs_from: &LanguageGroup) {
        let modded_langs = langs_from
            .langs
            .iter()
            .map(|lang| {
                let present_ancestors = lang
                    .ancestors
                    .iter()
                    .filter(|anc| self.protolanguage(anc).is_some())
                    .cloned()
                    .collect();
                Language {
                    ancestors: present_ancestors,
                    ..lang.clone()
                }
            })
            .collect();

        self.langs = modded_langs;
    }
}

// Language CRUD
impl LanguageGroup {
    pub fn create_language(&mut self, name: String) -> Result<(), LanguageGroupError> {
        if name.is_empty() {
            return Err(LanguageGroupError::LanguageEmptyName);
        }

        let existing = self.langs.iter().any(|lang| lang.name == name);
        if existing {
            return Err(LanguageGroupError::LanguageExists(name));
        }

        self.langs.push(Language {
            name,
            ..Default::default()
        });

        Ok(())
    }

    pub fn delete_language(&mut self, name: String) {
        let index = self.langs.iter().position(|lang| lang.name == name);

        if let Some(index) = index {
            self.langs.remove(index);
        }
    }

    pub fn language<S: AsRef<str>>(&self, name: S) -> Option<&Language> {
        self.langs.iter().find(|lang| lang.name == name.as_ref())
    }

    pub fn language_mut<S: AsRef<str>>(&mut self, name: S) -> Option<&mut Language> {
        self.langs
            .iter_mut()
            .find(|lang| lang.name == name.as_ref())
    }

    pub fn languages(&self) -> impl Iterator<Item = &Language> {
        self.langs.iter()
    }
}

// Protolanguage CRUD
impl LanguageGroup {
    pub fn create_protolanguage(&mut self, name: String) -> Result<(), LanguageGroupError> {
        if name.is_empty() {
            return Err(LanguageGroupError::ProtolanguageEmptyName);
        }

        let existing = self.protolangs.iter().any(|lang| lang.name == name);
        if existing {
            return Err(LanguageGroupError::ProtolanguageExists(name));
        }

        self.protolangs.push(Protolanguage {
            name,
            ..Default::default()
        });

        Ok(())
    }

    pub fn delete_protolanguage(&mut self, name: String) {
        let index = self.protolangs.iter().position(|lang| lang.name == name);

        if let Some(index) = index {
            self.protolangs.remove(index);
        }
    }

    pub fn protolanguage<S: AsRef<str>>(&self, name: S) -> Option<&Protolanguage> {
        self.protolangs
            .iter()
            .find(|lang| lang.name == name.as_ref())
    }

    pub fn protolanguage_mut<S: AsRef<str>>(&mut self, name: S) -> Option<&mut Protolanguage> {
        self.protolangs
            .iter_mut()
            .find(|lang| lang.name == name.as_ref())
    }

    pub fn protolanguages(&self) -> impl Iterator<Item = &Protolanguage> {
        self.protolangs.iter()
    }
}
