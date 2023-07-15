use crate::data::{Language, LanguageGroup, Protolanguage};
use askama::Template;
use serde::{Serialize, Serializer};
use std::fs::File;
use tauri::api::dialog::FileDialogBuilder;
use tauri::{command, State};
use crate::file::Project;

#[derive(Template)]
#[template(path = "export.typ.askama", escape = "none")]
struct ExportTemplate<'a> {
    name: &'a str,
    project: LanguageGroupExport<'a>,
}

struct LanguageGroupExport<'a> {
    protolangs: Vec<ProtolanguageExport<'a>>,
    langs: Vec<LanguageExport<'a>>,
}

impl<'a> From<&'a LanguageGroup> for LanguageGroupExport<'a> {
    fn from(value: &'a LanguageGroup) -> Self {
        LanguageGroupExport {
            protolangs: value.protolangs.iter().map(|lang| lang.into()).collect(),
            langs: value.langs.iter().map(|lang| lang.into()).collect(),
        }
    }
}

struct ProtolanguageExport<'a> {
    raw: &'a Protolanguage,
}

impl<'a> From<&'a Protolanguage> for ProtolanguageExport<'a> {
    fn from(value: &'a Protolanguage) -> Self {
        ProtolanguageExport {
            raw: value,
        }
    }
}

struct LanguageExport<'a> {
    raw: &'a Language,
}

impl<'a> From<&'a Language> for LanguageExport<'a> {
    fn from(value: &'a Language) -> Self {
        LanguageExport {
            raw: value,
        }
    }
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Askama(#[from] askama::Error),
    #[error("cannot export nameless project")]
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
pub fn test_export_language_group(project: State<Project>) -> Result<String, Error> {
    let project = project.inner().0.lock().unwrap();

    let rendered = ExportTemplate {
        name: &project.0,
        project: (&project.1).into(),
    }
    .render()?;

    if project.0.is_empty() {
        return Err(Error::EmptyName);
    }

    Ok(rendered.trim().to_string())
}

#[command]
pub async fn export_language_group<'a>(project: State<'a, Project>) -> Result<(), Error> {
    use std::io::Write;

    let (tx, rx) = oneshot::channel();

    let name = {
        let project = project.inner().0.lock().unwrap();
        project.0.clone()
    };

    if name.is_empty() {
        return Err(Error::EmptyName);
    }

    FileDialogBuilder::new()
        .add_filter(&name, &["typ"])
        .save_file(|file_path| {
            tx.send(file_path).unwrap();
        });

    if let Some(file_path) = rx.await.unwrap() {
        let project = project.inner().0.lock().unwrap();

        let rendered = ExportTemplate {
            name: &name,
            project: (&project.1).into(),
        }
        .render()?;

        let mut file = File::create(file_path)?;

        write!(file, "{}", rendered.trim())?;
    }

    Ok(())
}
