use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct LanguageGroup {
    version: String,
    protolangs: Vec<Protolanguage>
}

#[derive(Serialize, Deserialize)]
pub struct Protolanguage {

}