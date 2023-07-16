use super::Error;
use crate::data::Language;
use crate::file::Project;
use crate::ServiceState;
use std::time::Duration;
use tauri::{command, State, Window};

#[command]
pub fn create_language(project: State<Project>, name: String) -> Result<(), Error> {
    project.inner().0.lock().unwrap().1.create_language(name)?;

    Ok(())
}

#[command]
pub fn delete_language(project: State<Project>, name: String) -> Result<(), Error> {
    project.inner().0.lock().unwrap().1.delete_language(name);

    Ok(())
}

#[command]
pub fn get_language(project: State<Project>, name: String) -> Option<Language> {
    project.inner().0.lock().unwrap().1.language(name).cloned()
}

#[command]
pub fn init_languages_server(
    project: State<Project>,
    window: Window,
    services: State<ServiceState>,
) {
    let project = project.inner().clone();
    if !services.inner().0.read().unwrap().languages {
        log::info!("Starting languages server...");
        std::thread::spawn(move || loop {
            let names: Vec<_> = {
                let project = &project.0.lock().unwrap().1;
                project.languages().map(|lang| lang.name.clone()).collect()
            };
            window.emit("all_languages", names).unwrap();

            std::thread::sleep(Duration::from_millis(500));
        });
        services.inner().0.write().unwrap().languages = true;
    }
}
