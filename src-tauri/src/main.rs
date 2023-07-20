// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, RwLock};

use tauri::{generate_handler, CustomMenuItem, SystemTray, SystemTrayMenu};
use tauri_plugin_log::LogTarget;

use crate::file::Project;

mod data;
mod export;
mod file;
mod interact;
mod parser;
mod util;

pub struct StateRaw {}

impl StateRaw {
    fn new() -> Self {
        Self {}
    }
}

pub struct AppState(Arc<RwLock<StateRaw>>);

impl AppState {
    fn new() -> Self {
        Self(Arc::new(RwLock::new(StateRaw::new())))
    }
}

pub struct ProgramStart(chrono::DateTime<chrono::Local>);

fn main() {
    let last_autosave =
        CustomMenuItem::new("last_autosave".to_string(), "No autosave this session").disabled();
    let menu = SystemTrayMenu::new().add_item(last_autosave);
    let tray = SystemTray::new().with_menu(menu);
    tauri::Builder::default()
        .manage(Project::new())
        .manage(AppState::new())
        .manage(ProgramStart(chrono::Local::now())) // Program start timestamp
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .build(),
        )
        .system_tray(tray)
        .invoke_handler(generate_handler![
            file::request_autosave,
            file::save_language_group,
            file::load_language_group,
            file::merge_language_group,
            file::get_language_groups,
            file::delete_language_group,
            export::export_language_group,
            export::test_export_language_group,
            util::from_branner,
            util::from_sil,
            util::display_phone,
            interact::new_language_group,
            interact::epoch_language_group,
            interact::dump_language_group,
            interact::get_project_name,
            interact::set_project_name,
            interact::get_family_id,
            interact::create_language,
            interact::delete_language,
            interact::get_language,
            interact::get_language_description,
            interact::set_language_description,
            interact::get_all_languages,
            interact::create_language_phoneme,
            interact::create_protolanguage,
            interact::delete_protolanguage,
            interact::get_protolanguage,
            interact::get_protolanguage_description,
            interact::set_protolanguage_description,
            interact::get_all_protolanguages,
            interact::create_protolanguage_phoneme,
            interact::set_phoneme,
            interact::get_phoneme,
            interact::delete_phoneme,
            interact::get_phonemes,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
