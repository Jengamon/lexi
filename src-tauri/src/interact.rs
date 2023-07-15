use std::time::Duration;

use serde::Serialize;
use tauri::{command, State, Window};

use crate::data::{Language, LanguageGroup, Protolanguage};
use crate::file::Project;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Serde(#[from] serde_json::Error),
    #[error("cannot create a language with a blank name")]
    LanguageEmptyName,
    #[error("the language named {0} already exists")]
    LanguageExists(String),
    #[error("cannot create a proto-language with a blank name")]
    ProtolanguageEmptyName,
    #[error("the proto-language named {0} already exists")]
    ProtolanguageExists(String),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.to_string().as_str())
    }
}

#[command]
pub fn new_language_group(project: State<Project>) {
    project.0.lock().unwrap().1 = LanguageGroup::default();
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
pub fn set_project_name(project: State<Project>, name: String) {
    project.0.lock().unwrap().0 = name;
}

#[command]
pub fn create_language(project: State<Project>, name: String) -> Result<(), Error> {
    if name.is_empty() {
        return Err(Error::LanguageEmptyName);
    }

    let project = &mut project.inner().0.lock().unwrap().1;

    let existing = project.langs.iter().any(|lang| lang.name == name);
    if existing {
        return Err(Error::LanguageExists(name));
    }

    project.langs.push(Language {
        name,
        ..Default::default()
    });

    Ok(())
}

#[command]
pub fn delete_language(project: State<Project>, name: String) -> Result<(), Error> {
    let project = &mut project.inner().0.lock().unwrap().1;

    let index = project.langs.iter().position(|lang| lang.name == name);

    if let Some(index) = index {
        project.langs.remove(index);
    }

    Ok(())
}

#[command]
pub fn get_language(project: State<Project>, name: String) -> Option<Language> {
    let project = &project.inner().0.lock().unwrap().1;

    project.langs.iter().find(|lang| lang.name == name).cloned()
}

#[command]
pub fn init_languages_server(project: State<Project>, window: Window) {
    let project = project.inner().clone();
    std::thread::spawn(move || loop {
        let names: Vec<_> = {
            let project = &project.0.lock().unwrap().1;
            project.langs.iter().map(|lang| lang.name.clone()).collect()
        };
        window.emit("all_languages", names).unwrap();

        std::thread::sleep(Duration::from_millis(500));
    });
}

#[command]
pub fn create_protolanguage(project: State<Project>, name: String) -> Result<(), Error> {
    if name.is_empty() {
        return Err(Error::ProtolanguageEmptyName);
    }

    let project = &mut project.inner().0.lock().unwrap().1;

    let existing = project.protolangs.iter().any(|lang| lang.name == name);
    if existing {
        return Err(Error::ProtolanguageExists(name));
    }

    project.protolangs.push(Protolanguage {
        name,
        ..Default::default()
    });

    Ok(())
}

#[command]
pub fn delete_protolanguage(project: State<Project>, name: String) -> Result<(), Error> {
    let project = &mut project.inner().0.lock().unwrap().1;

    let index = project.protolangs.iter().position(|lang| lang.name == name);

    if let Some(index) = index {
        project.protolangs.remove(index);
    }

    Ok(())
}

#[command]
pub fn get_protolanguage(project: State<Project>, name: String) -> Option<Protolanguage> {
    let project = &project.inner().0.lock().unwrap().1;

    project
        .protolangs
        .iter()
        .find(|lang| lang.name == name)
        .cloned()
}

#[command]
pub fn init_protolanguages_server(project: State<Project>, window: Window) {
    let project = project.inner().clone();
    std::thread::spawn(move || loop {
        let names: Vec<_> = {
            let project = &project.0.lock().unwrap().1;
            project
                .protolangs
                .iter()
                .map(|lang| lang.name.clone())
                .collect()
        };
        window.emit("all_protolanguages", names).unwrap();

        std::thread::sleep(Duration::from_millis(500));
    });
}
