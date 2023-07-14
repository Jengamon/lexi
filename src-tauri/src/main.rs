// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::generate_handler;

mod file;
mod data;

fn main() {
    tauri::Builder::default()
        .invoke_handler(generate_handler![
            file::save_language_group,
            file::load_language_group,
            file::get_language_groups,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
