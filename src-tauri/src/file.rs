use std::sync::Mutex;
use std::time::Duration;
use std::{fs::File, sync::Arc};

use anyhow::{anyhow, Context};
use chrono::{DateTime, Local};
use directories::ProjectDirs;
use regex::Regex;
use semver::{Version, VersionReq};
use serde::{Serialize, Serializer};
use tauri::{command, State, Window};
use uuid::Uuid;

use crate::data::LanguageGroup;
use crate::{ProgramStart, ServiceState};

const VERSION_REQ: &'static str = "^0";

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
    #[error(transparent)]
    Anyhow(#[from] anyhow::Error),
    #[error("cannot find project directory for this OS")]
    CannotFindProjectDir,
    #[error("cannot load projects from version {0}")]
    VersionMismatch(Version),
    #[error("cannot save to empty name")]
    EmptyName,
    #[error("cannot merge language group family {merge} -> {current}")]
    FamilyMismatch { current: Uuid, merge: Uuid },
    #[error("cannot merge nothing")]
    MergeEmpty,
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
    program_start: State<ProgramStart>,
) {
    if services.inner().0.read().unwrap().autosave.is_none() {
        log::info!("Starting autosave service (halfminutes: {half_minutes})...");
        let project = project.inner().clone();
        let program_start = program_start.inner().0;
        std::thread::spawn(move || loop {
            std::thread::sleep(Duration::from_secs(half_minutes as u64 * 30));

            let timestamp = Local::now();

            let filename = {
                let eproject = project.0.lock().unwrap();
                if eproject.0.is_empty() {
                    format!("autosave_{}", program_start.format("%G%m%d_%H%M%S"))
                } else {
                    eproject.0.clone()
                }
            };

            if let Ok(()) = _save_language_group(filename.clone(), &project, false) {
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
    _save_language_group(filename, project.inner(), true)
}

pub fn _save_language_group(
    filename: String,
    project: &Project,
    backup: bool,
) -> Result<(), Error> {
    use std::io::Write;

    let sanitized = filename.replace("../", "");

    if sanitized.is_empty() {
        return Err(Error::EmptyName);
    }

    if let Some(project_dirs) = ProjectDirs::from("io.jengamon", "Muurmon", "Lexi") {
        let loc = format!("data/lang/{sanitized}.lg.json");

        let path = project_dirs.data_dir().join(loc);

        if path.exists() && backup {
            std::fs::rename(path.clone(), format!("{}.bak", path.display()))
                .with_context(|| format!("Failed to create backup: {}.bak", path.display()))?;
        }

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
            VersionReq::parse(VERSION_REQ).expect("INTERNAL failed to compile version req string");

        if version_req.matches(&lang_group.version) {
            *project.0.lock().unwrap() = (filename, lang_group);
            Ok(())
        } else {
            Err(Error::VersionMismatch(lang_group.version))
        }
    } else {
        Err(Error::CannotFindProjectDir)
    }
}

#[command]
pub fn merge_language_group(filename: String, project: State<Project>) -> Result<(), Error> {
    let sanitized = filename.replace("../", "");

    if filename.is_empty() {
        return Err(Error::MergeEmpty);
    }

    if let Some(project_dirs) = ProjectDirs::from("io.jengamon", "Muurmon", "Lexi") {
        let loc = format!("data/lang/{sanitized}.lg.json");

        let path = project_dirs.data_dir().join(loc);

        let file = File::open(path)?;

        let lang_group: LanguageGroup = serde_json::from_reader(file)?;

        // Check for validity

        let version_req =
            VersionReq::parse(VERSION_REQ).expect("INTERNAL failed to compile version req string");

        if version_req.matches(&lang_group.version) {
            let target_lg = &mut project.0.lock().unwrap().1;
            if target_lg.family_id == lang_group.family_id {
                target_lg.merge(&lang_group);
                Ok(())
            } else {
                Err(Error::FamilyMismatch {
                    current: target_lg.family_id,
                    merge: lang_group.family_id,
                })
            }
        } else {
            Err(Error::VersionMismatch(lang_group.version))
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
