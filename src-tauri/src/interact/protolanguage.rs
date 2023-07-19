use super::Error;
use crate::data::{BaseLanguage, Phoneme, Protolanguage};
use crate::file::Project;
use crate::ServiceState;
use std::time::Duration;
use tauri::{command, State, Window};
use uuid::Uuid;

#[command]
pub fn create_protolanguage(project: State<Project>, name: String) -> Result<(), Error> {
    project
        .inner()
        .0
        .lock()
        .unwrap()
        .1
        .create_protolanguage(name)?;

    Ok(())
}

#[command]
pub fn delete_protolanguage(project: State<Project>, name: String) -> Result<(), Error> {
    project
        .inner()
        .0
        .lock()
        .unwrap()
        .1
        .delete_protolanguage(name);

    Ok(())
}

#[command]
pub fn get_protolanguage(project: State<Project>, name: String) -> Option<Protolanguage> {
    project
        .inner()
        .0
        .lock()
        .unwrap()
        .1
        .protolanguage(name)
        .cloned()
}

#[command]
pub fn get_protolanguage_description(
    project: State<Project>,
    name: String,
) -> Option<serde_json::Value> {
    project
        .inner()
        .0
        .lock()
        .unwrap()
        .1
        .protolanguage(name)
        .and_then(BaseLanguage::description)
        .cloned()
}

#[command]
pub fn set_protolanguage_description(
    project: State<Project>,
    name: String,
    description: serde_json::Value,
) {
    if let Some(lang) = project.inner().0.lock().unwrap().1.protolanguage_mut(name) {
        lang.description = Some(description);
    }
}

#[command]
pub fn init_protolanguages_server(
    project: State<Project>,
    window: Window,
    services: State<ServiceState>,
) {
    let project = project.inner().clone();
    if !services.inner().0.read().unwrap().protolanguages {
        log::info!("Starting protolanguages server...");
        std::thread::spawn(move || loop {
            let names: Vec<_> = {
                let project = &project.0.lock().unwrap().1;
                project
                    .protolanguages()
                    .map(|lang| lang.name.clone())
                    .collect()
            };
            window.emit("all_protolanguages", names).unwrap();

            std::thread::sleep(Duration::from_millis(500));
        });
        services.inner().0.write().unwrap().protolanguages = true;
    }
}

#[command]
pub fn create_protolanguage_phoneme(
    project: State<Project>,
    name: String,
    phoneme: Phoneme,
) -> Option<Uuid> {
    let new_id = Uuid::new_v4();
    let ref mut project = project.inner().0.lock().unwrap().1;
    let lang = project.protolanguage_mut(name);
    if let Some(proto) = lang {
        proto.phonemes.insert(new_id, phoneme.validated());
        Some(new_id)
    } else {
        None
    }
}
