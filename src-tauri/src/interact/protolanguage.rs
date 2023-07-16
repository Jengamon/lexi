use super::Error;
use crate::data::Protolanguage;
use crate::file::Project;
use crate::ServiceState;
use std::time::Duration;
use tauri::{command, State, Window};

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
                    .protolangs
                    .iter()
                    .map(|lang| lang.name.clone())
                    .collect()
            };
            window.emit("all_protolanguages", names).unwrap();

            std::thread::sleep(Duration::from_millis(500));
        });
        services.inner().0.write().unwrap().protolanguages = true;
    }
}
