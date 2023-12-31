use crate::data::Phone;
use ipa_translate::{branner_to_ipa, sil_to_ipa};
use tauri::command;

#[command]
pub fn from_branner(input: String) -> String {
    branner_to_ipa(&input).replace('\u{200b}', "")
}

#[command]
pub fn from_sil(input: String) -> String {
    sil_to_ipa(&input).replace('\u{200b}', "")
}

#[command]
pub fn display_phone(phone: Phone) -> String {
    phone.to_string().replace('\u{200b}', "")
}
