use crate::data::{Language, LanguageGroup, Protolanguage};
use askama::Template;
use serde::{Serialize, Serializer};
use std::fs::File;
use tauri::api::dialog::FileDialogBuilder;
use tauri::command;

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
pub fn test_export_language_group(name: String, project: LanguageGroup) -> Result<String, Error> {
    let rendered = ExportTemplate {
        name: name.as_str(),
        project: (&project).into(),
    }
    .render()?;

    if name.is_empty() {
        return Err(Error::EmptyName);
    }

    Ok(rendered.trim().to_string())
}

#[command]
pub async fn export_language_group(name: String, project: LanguageGroup) -> Result<(), Error> {
    use std::io::Write;

    if name.is_empty() {
        return Err(Error::EmptyName);
    }

    let (tx, rx) = oneshot::channel();

    FileDialogBuilder::new()
        .add_filter(&name, &["typ"])
        .save_file(|file_path| {
            tx.send(file_path).unwrap();
        });

    if let Some(file_path) = rx.await.unwrap() {
        let rendered = ExportTemplate {
            name: name.as_str(),
            project: (&project).into(),
        }
        .render()?;

        let mut file = File::create(file_path)?;

        write!(file, "{}", rendered.trim())?;
    }

    Ok(())
}
