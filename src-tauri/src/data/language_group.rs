use std::collections::HashMap;

use semver::Version;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::{Language, Protolanguage};

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

// General utility
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

#[cfg(test)]
mod tests {
    use super::LanguageGroup;
    use crate::data::{Language, Phone, Phoneme, Protolanguage};
    use insta::{assert_yaml_snapshot, with_settings};
    use std::collections::{HashMap, HashSet};
    use uuid::uuid;

    #[test]
    fn lg_epoch_preserves_protophonemes_in_language() {
        let mut pre = LanguageGroup {
            family_id: uuid!("00000000-0000-0000-0000-000000000000"),
            protolangs: vec![Protolanguage {
                name: "1".to_string(),
                description: None,
                phonemes: {
                    let mut map = HashMap::new();
                    map.insert(
                        uuid!("00000000-0000-0000-0000-000000000000"),
                        Phoneme {
                            ortho: "1".to_string(),
                            primary: Phone::Plosive {
                                place: crate::data::Place::Bilabial,
                                voiced: false,
                                attachments: HashSet::new(),
                            },
                            allo: vec![],
                        },
                    );
                    map
                },
            }],
            langs: vec![Language {
                name: "1'".to_string(),
                ancestors: vec!["1".to_string()],
                description: None,
                phonemes: {
                    let mut map = HashMap::new();
                    map.insert(
                        uuid!("00000000-0000-0000-0000-000000000001"),
                        Phoneme {
                            ortho: "2".to_string(),
                            primary: Phone::Plosive {
                                place: crate::data::Place::Bilabial,
                                voiced: true,
                                attachments: HashSet::new(),
                            },
                            allo: vec![],
                        },
                    );
                    map
                },
            }],
            ..Default::default()
        };

        pre.epoch();

        with_settings!({sort_maps => true}, {
            assert_yaml_snapshot!(pre);
        })
    }

    #[test]
    fn epoch_when_phoneme_and_protophoneme_exist_keeps_phoneme() {
        let mut pre = LanguageGroup {
            family_id: uuid!("00000000-0000-0000-0000-000000000000"),
            protolangs: vec![Protolanguage {
                name: "1".to_string(),
                description: None,
                phonemes: {
                    let mut map = HashMap::new();
                    map.insert(
                        uuid!("00000000-0000-0000-0000-000000000000"),
                        Phoneme {
                            ortho: "1".to_string(),
                            primary: Phone::Plosive {
                                place: crate::data::Place::Bilabial,
                                voiced: false,
                                attachments: HashSet::new(),
                            },
                            allo: vec![],
                        },
                    );
                    map
                },
            }],
            langs: vec![Language {
                name: "1'".to_string(),
                ancestors: vec!["1".to_string()],
                description: None,
                phonemes: {
                    let mut map = HashMap::new();
                    map.insert(
                        uuid!("00000000-0000-0000-0000-000000000000"),
                        Phoneme {
                            ortho: "2".to_string(),
                            primary: Phone::Plosive {
                                place: crate::data::Place::Bilabial,
                                voiced: true,
                                attachments: HashSet::new(),
                            },
                            allo: vec![],
                        },
                    );
                    map
                },
            }],
            ..Default::default()
        };

        pre.epoch();

        with_settings!({sort_maps => true}, {
            assert_yaml_snapshot!(pre);
        })
    }

    #[test]
    fn merge_removes_nonexistant_ancestors_and_referents() {
        // TODO once we start referring to protolanguages,
        // items that reference invalid protolanguages should be wiped!
        let pre = LanguageGroup {
            family_id: uuid!("00000000-0000-0000-0000-000000000000"),
            protolangs: vec![Protolanguage {
                name: "1".to_string(),
                description: None,
                phonemes: HashMap::new(),
            }],
            langs: vec![Language {
                name: "A".to_string(),
                description: None,
                phonemes: HashMap::new(),
                ancestors: vec!["1".to_string()],
            }],
            ..Default::default()
        };

        let post_a = LanguageGroup {
            family_id: uuid!("00000000-0000-0000-0000-000000000000"),
            protolangs: vec![],
            langs: vec![Language {
                name: "2".to_string(),
                description: None,
                phonemes: HashMap::new(),
                ancestors: vec!["H".to_string()],
            }],
            ..Default::default()
        };

        let post_b = LanguageGroup {
            family_id: uuid!("00000000-0000-0000-0000-000000000000"),
            protolangs: vec![],
            langs: vec![Language {
                name: "2".to_string(),
                description: None,
                phonemes: HashMap::new(),
                ancestors: vec!["1".to_string()],
            }],
            ..Default::default()
        };

        with_settings!({sort_maps => true}, {
            assert_yaml_snapshot!({
                let mut pre = pre.clone();
                pre.merge(&post_a);
                pre
            });

            assert_yaml_snapshot!({
                let mut pre = pre.clone();
                pre.merge(&post_b);
                pre
            });
        });
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
