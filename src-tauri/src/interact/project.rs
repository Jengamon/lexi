use super::Error;
use crate::data::LanguageGroup;
use crate::file::Project;
use tauri::{command, State};

#[command]
pub fn new_language_group(project: State<Project>) {
    project.0.lock().unwrap().1 = LanguageGroup::default();
}

#[command]
pub fn epoch_language_group(project: State<Project>) {
    let mut project = project.0.lock().unwrap();
    project.1.epoch();
    project.0 = format!("{}_epoch", project.0);
}

#[command]
pub fn dump_language_group(project: State<Project>) -> Result<String, Error> {
    Ok(serde_json::to_string_pretty(&project.0.lock().unwrap().1)?)
}

#[command]
pub fn get_project_name(project: State<Project>) -> String {
    project.0.lock().unwrap().0.clone()
}

#[command]
pub fn get_family_id(project: State<Project>) -> uuid::Uuid {
    project.0.lock().unwrap().1.family_id
}

#[command]
pub fn set_project_name(project: State<Project>, name: String) {
    project.0.lock().unwrap().0 = name;
}
