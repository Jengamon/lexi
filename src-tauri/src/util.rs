use ipa_translate::branner_to_ipa;
use tauri::command;

#[command]
pub fn from_branner(input: String) -> String {
    branner_to_ipa(&input)
}