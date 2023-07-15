// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::generate_handler;

mod file;
mod data;
mod export;
mod util;

fn main() {
    tauri::Builder::default()
        .invoke_handler(generate_handler![
            file::save_language_group,
            file::load_language_group,
            file::get_language_groups,
            file::delete_language_group,
            export::export_language_group,
            export::test_export_language_group,
            util::from_branner,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
