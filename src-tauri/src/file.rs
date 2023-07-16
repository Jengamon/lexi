use std::sync::Mutex;
use std::time::Duration;
use std::{fs::File, sync::Arc};

use chrono::{DateTime, Local};
use directories::ProjectDirs;
use regex::Regex;
use semver::{Version, VersionReq};
use serde::{Serialize, Serializer};
use tauri::{command, State, Window};

use crate::data::LanguageGroup;
use crate::ServiceState;

#[derive(Clone)]
pub struct Project(pub(crate) Arc<Mutex<(String, LanguageGroup)>>);

impl Project {
    pub fn new() -> Self {
        Self(Arc::new(Mutex::new((
            String::new(),
            LanguageGroup::default(),
        ))))
    }
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Json(#[from] serde_json::Error),
    #[error(transparent)]
    Glob(#[from] glob::GlobError),
    #[error("cannot find project directory for this OS")]
    CannotFindProjectDir,
    #[error("cannot load projects from version {0}")]
    VersionMismatch(Version),
    #[error("cannot save to empty name")]
    EmptyName,
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_str())
    }
}

#[derive(Serialize, Clone)]
struct AutosaveEvent {
    name: String,
    timestamp: DateTime<Local>,
}

// Services do stuff on a thread.
// Servers actually send stuff to the application.
#[command]
pub fn init_autosave_service(
    half_minutes: u32,
    window: Window,
    project: State<Project>,
    services: State<ServiceState>,
) {
    if services.inner().0.read().unwrap().autosave.is_none() {
        log::info!("Starting autosave service (halfminutes: {half_minutes})...");
        let project = project.inner().clone();
        std::thread::spawn(move || loop {
            std::thread::sleep(Duration::from_secs(half_minutes as u64 * 30));

            let timestamp = Local::now();

            let filename = {
                let eproject = project.0.lock().unwrap();
                if eproject.0.is_empty() {
                    "autosave".to_string()
                } else {
                    eproject.0.clone()
                }
            };

            if let Ok(()) = _save_language_group(filename.clone(), &project) {
                window
                    .emit(
                        "autosaved",
                        AutosaveEvent {
                            name: filename,
                            timestamp,
                        },
                    )
                    .unwrap();
            }
        });
        services.0.write().unwrap().autosave = Some((half_minutes,));
    } else {
        log::info!("Changing wait time (halfminutes: {half_minutes})...");
        services.0.write().unwrap().autosave = Some((half_minutes,));
    }
}

#[command]
pub async fn get_language_groups() -> Result<Vec<String>, Error> {
    let mut names = vec![];
    let lg_suffix: Regex = Regex::new(r"\.lg$").unwrap();

    if let Some(project_dirs) = ProjectDirs::from("io.jengamon", "Muurmon", "Lexi") {
        for result in glob::glob(&format!(
            "{}/data/lang/*.lg.json",
            project_dirs.data_dir().display()
        ))
        .unwrap()
        {
            let file_path = result?;
            let file_stem = file_path.file_stem().unwrap().to_string_lossy();

            let true_name = lg_suffix.replace(&file_stem, "");

            names.push(true_name.to_string());
        }
    }

    Ok(names)
}

#[command]
pub fn save_language_group(filename: String, project: State<Project>) -> Result<(), Error> {
    _save_language_group(filename, project.inner())
}

pub fn _save_language_group(filename: String, project: &Project) -> Result<(), Error> {
    use std::io::Write;

    let sanitized = filename.replace("../", "");

    if sanitized.is_empty() {
        return Err(Error::EmptyName);
    }

    if let Some(project_dirs) = ProjectDirs::from("io.jengamon", "Muurmon", "Lexi") {
        let loc = format!("data/lang/{sanitized}.lg.json");

        let path = project_dirs.data_dir().join(loc);

        std::fs::create_dir_all(path.parent().unwrap())?;
        let mut file = File::create(path)?;

        write!(
            file,
            "{}",
            serde_json::to_string(&project.0.lock().unwrap().1)?
        )?;

        Ok(())
    } else {
        Err(Error::CannotFindProjectDir)
    }
}

#[command]
pub fn load_language_group(filename: String, project: State<Project>) -> Result<(), Error> {
    let sanitized = filename.replace("../", "");

    if let Some(project_dirs) = ProjectDirs::from("io.jengamon", "Muurmon", "Lexi") {
        let loc = format!("data/lang/{sanitized}.lg.json");

        let path = project_dirs.data_dir().join(loc);

        let file = File::open(path)?;

        let lang_group: LanguageGroup = serde_json::from_reader(file)?;

        // Check for validity

        let version_req =
            VersionReq::parse("^0").expect("INTERNAL failed to compile version req string");

        if version_req.matches(&lang_group.version) {
            *project.0.lock().unwrap() = (filename, lang_group);
            Ok(())
        } else {
            return Err(Error::VersionMismatch(lang_group.version));
        }
    } else {
        Err(Error::CannotFindProjectDir)
    }
}

#[command]
pub async fn delete_language_group(filename: String) -> Result<(), Error> {
    let sanitized = filename.replace("../", "");

    if let Some(project_dirs) = ProjectDirs::from("io.jengamon", "Muurmon", "Lexi") {
        let loc = format!("data/lang/{sanitized}.lg.json");

        let path = project_dirs.data_dir().join(loc);

        std::fs::remove_file(path)?;

        Ok(())
    } else {
        Err(Error::CannotFindProjectDir)
    }
}
