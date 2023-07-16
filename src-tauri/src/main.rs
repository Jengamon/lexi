// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::atomic::AtomicBool;
use std::sync::{Mutex, RwLock};
use std::thread::JoinHandle;

use tauri::generate_handler;
use tauri_plugin_log::LogTarget;

use crate::data::LanguageGroup;
use crate::file::Project;

mod data;
mod export;
mod file;
mod interact;
mod util;

pub struct ServiceStateRaw {
    autosave: bool,
    languages: bool,
    protolanguages: bool,
}

impl ServiceStateRaw {
    fn new() -> Self {
        Self {
            autosave: false,
            languages: false,
            protolanguages: false,
        }
    }
}

pub struct ServiceState(RwLock<ServiceStateRaw>);

impl ServiceState {
    fn new() -> Self {
        Self(RwLock::new(ServiceStateRaw::new()))
    }
}

fn main() {
    tauri::Builder::default()
        .manage(Project::new())
        .manage(ServiceState::new())
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .build(),
        )
        .invoke_handler(generate_handler![
            file::init_autosave_service,
            file::save_language_group,
            file::load_language_group,
            file::get_language_groups,
            file::delete_language_group,
            export::export_language_group,
            export::test_export_language_group,
            util::from_branner,
            util::display_phone,
            util::display_phone_branner,
            interact::new_language_group,
            interact::dump_language_group,
            interact::get_project_name,
            interact::set_project_name,
            interact::create_language,
            interact::delete_language,
            interact::get_language,
            interact::init_languages_server,
            interact::create_protolanguage,
            interact::delete_protolanguage,
            interact::get_protolanguage,
            interact::init_protolanguages_server,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
