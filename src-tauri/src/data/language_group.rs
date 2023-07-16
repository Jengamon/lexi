use semver::Version;
use serde::{Deserialize, Serialize};

use super::{Language, Protolanguage};

#[derive(Serialize, Deserialize)]
pub struct LanguageGroup {
    pub version: Version,
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
            protolangs: vec![],
            langs: vec![],
        }
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
