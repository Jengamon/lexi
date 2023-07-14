use directories::ProjectDirs;
use serde::{Serialize, Serializer};
use std::fs::File;
use regex::Regex;
use tauri::command;
use crate::data::LanguageGroup;

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

#[command]
pub async fn get_language_groups() -> Result<Vec<String>, Error> {
    let mut names = vec![];
    let lg_suffix: Regex = Regex::new(r"\.lg$").unwrap();

    if let Some(project_dirs) = ProjectDirs::from("io.jengamon", "Muurmon", "Lexi") {
        for result in glob::glob(&format!("{}/data/lang/*.lg.json", project_dirs.data_dir().display())).unwrap() {
            let file_path = result?;
            let file_stem = file_path.file_stem().unwrap().to_string_lossy();

            let true_name = lg_suffix.replace(&file_stem, "");

            names.push(true_name.to_string());
        }
    }

    Ok(names)
}

#[command]
pub fn save_language_group(filename: String, lang_group: LanguageGroup) -> Result<(), Error> {
    use std::io::Write;

    let sanitized = filename.replace("../", "");

    if sanitized.is_empty() {
        return Err(Error::EmptyName)
    }

    if let Some(project_dirs) = ProjectDirs::from("io.jengamon", "Muurmon", "Lexi") {
        let loc = format!("data/lang/{sanitized}.lg.json");

        let path = project_dirs.data_dir().join(loc);

        std::fs::create_dir_all(path.parent().unwrap())?;
        let mut file = File::create(path)?;

        write!(file, "{}", serde_json::to_string(&lang_group)?)?;

        Ok(())
    } else {
        Err(Error::CannotFindProjectDir)
    }
}

#[command]
pub fn load_language_group(filename: String) -> Result<LanguageGroup, Error> {
    let sanitized = filename.replace("../", "");

    if let Some(project_dirs) = ProjectDirs::from("io.jengamon", "Muurmon", "Lexi") {
        let loc = format!("data/lang/{sanitized}.lg.json");

        let path = project_dirs.data_dir().join(loc);

        let file = File::open(path)?;

        let lang_group: LanguageGroup = serde_json::from_reader(file)?;

        Ok(lang_group)
    } else {
        Err(Error::CannotFindProjectDir)
    }
}
