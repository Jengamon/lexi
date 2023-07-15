use ipa_translate::branner_to_ipa;
use tauri::command;
use crate::data::Phone;

#[command]
pub fn from_branner(input: String) -> String {
    branner_to_ipa(&input)
}

#[command]
pub fn display_phone(phone: Phone) -> String {
    branner_to_ipa(&phone.to_string())
}

#[command]
pub fn display_phone_branner(phone: Phone) -> String {
    phone.to_string()
}