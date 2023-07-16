use serde::Serialize;

mod language;
mod project;
mod protolanguage;

pub use language::*;
pub use project::*;
pub use protolanguage::*;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Serde(#[from] serde_json::Error),
    #[error("cannot create a language with a blank name")]
    LanguageEmptyName,
    #[error("the language named {0} already exists")]
    LanguageExists(String),
    #[error("cannot create a proto-language with a blank name")]
    ProtolanguageEmptyName,
    #[error("the proto-language named {0} already exists")]
    ProtolanguageExists(String),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.to_string().as_str())
    }
}
