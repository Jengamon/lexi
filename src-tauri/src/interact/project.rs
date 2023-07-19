use super::Error;
use crate::data::{BaseLanguage, LanguageGroup, LanguageType, Phoneme};
use crate::file::Project;
use regex::Regex;
use tauri::{command, State};
use uuid::Uuid;

#[command]
pub fn new_language_group(project: State<Project>) {
    project.0.lock().unwrap().1 = LanguageGroup::default();
}

#[command]
pub fn epoch_language_group(project: State<Project>) {
    let epoch_detect = Regex::new("(.*)([0-9]+)$").unwrap();
    let mut project = project.0.lock().unwrap();
    project.1.epoch();
    project.0 = if let Some(matches) = epoch_detect.captures(&project.0) {
        format!(
            "{}{}",
            matches.get(1).unwrap().as_str(),
            matches.get(2).unwrap().as_str().parse::<u32>().unwrap() + 1
        )
    } else {
        format!("{}_epoch", project.0)
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

#[command]
pub fn set_phoneme(
    project: State<Project>,
    name: String,
    name_type: LanguageType,
    id: Uuid,
    phoneme: Phoneme,
) -> bool {
    let ref mut project = project.inner().0.lock().unwrap().1;
    let protolangs = project.protolangs.clone();
    let lang: Option<_> = match name_type {
        LanguageType::Protolanguage => project
            .protolanguage_mut(name)
            .map(|l| l as &mut dyn BaseLanguage),
        LanguageType::Language => project
            .language_mut(name)
            .map(|l| l as &mut dyn BaseLanguage),
    };

    if let Some(lang) = lang {
        LanguageGroup::set_phoneme(&protolangs, lang, id, phoneme.validated())
    } else {
        false
    }
}

#[command]
pub fn get_phoneme(
    project: State<Project>,
    name: String,
    name_type: LanguageType,
    id: Uuid,
) -> Option<Phoneme> {
    let ref mut project = project.inner().0.lock().unwrap().1;
    let protolangs = project.protolangs.clone();
    let lang: Option<_> = match name_type {
        LanguageType::Protolanguage => project.protolanguage(name).map(|l| l as &dyn BaseLanguage),
        LanguageType::Language => project.language(name).map(|l| l as &dyn BaseLanguage),
    };

    if let Some(lang) = lang {
        LanguageGroup::get_phoneme(&protolangs, lang, id).cloned()
    } else {
        None
    }
}

#[command]
pub fn delete_phoneme(
    project: State<Project>,
    name: String,
    name_type: LanguageType,
    id: Uuid,
) -> Option<Phoneme> {
    let ref mut project = project.inner().0.lock().unwrap().1;
    let lang: Option<_> = match name_type {
        LanguageType::Protolanguage => project
            .protolanguage_mut(name)
            .map(|l| l as &mut dyn BaseLanguage),
        LanguageType::Language => project
            .language_mut(name)
            .map(|l| l as &mut dyn BaseLanguage),
    };

    if let Some(lang) = lang {
        lang.phonemes_mut().remove(&id)
    } else {
        None
    }
}

#[command]
pub fn get_phonemes(
    project: State<Project>,
    name: String,
    name_type: LanguageType,
) -> Vec<(Uuid, Phoneme)> {
    let ref mut project = project.inner().0.lock().unwrap().1;
    let lang: Option<_> = match name_type {
        LanguageType::Protolanguage => project.protolanguage(name).map(|l| l as &dyn BaseLanguage),
        LanguageType::Language => project.language(name).map(|l| l as &dyn BaseLanguage),
    };

    if let Some(lang) = lang {
        lang.phonemes()
            .iter()
            .map(|(k, v)| (*k, v.clone()))
            .chain(
                lang.ancestors()
                    .into_iter()
                    .filter_map(|anc| project.protolangs.iter().find(|lang| lang.name == anc))
                    .flat_map(|lang| lang.phonemes().iter().map(|(k, v)| (*k, v.clone()))),
            )
            .collect()
    } else {
        vec![]
    }
}
