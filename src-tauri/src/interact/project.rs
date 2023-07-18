use super::Error;
use crate::data::LanguageGroup;
use crate::file::Project;
use regex::Regex;
use tauri::{command, State};

#[command]
pub fn new_language_group(project: State<Project>) {
    project.0.lock().unwrap().1 = LanguageGroup::default();
}

#[command]
pub fn epoch_language_group(project: State<Project>) {
    let epoch_detect = Regex::new("(.*)_epoch([0-9]+)$").unwrap();
    let mut project = project.0.lock().unwrap();
    project.1.epoch();
    project.0 = if let Some(matches) = epoch_detect.captures(&project.0) {
        format!(
            "{}_epoch{}",
            matches.get(1).unwrap().as_str(),
            matches.get(2).unwrap().as_str().parse::<u32>().unwrap() + 1
        )
    } else {
        format!("{}_epoched", project.0)
    };
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
