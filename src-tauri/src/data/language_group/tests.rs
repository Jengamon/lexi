use super::LanguageGroup;
use crate::data::{Language, Phone, Phoneme, Protolanguage};
use insta::{assert_yaml_snapshot, with_settings};
use std::collections::{HashMap, HashSet};
use uuid::uuid;

#[test]
fn lg_deny_set_phoneme_if_nonexistant() {
    let mut lg = LanguageGroup {
        family_id: uuid!("00000000-0000-0000-0000-000000000000"),
        protolangs: vec![Protolanguage {
            name: "1".to_string(),
            ..Default::default()
        }],
        langs: vec![Language {
            name: "1".to_string(),
            ancestors: vec!["1".to_string()],
            ..Default::default()
        }],
        ..Default::default()
    };

    assert_eq!(
        LanguageGroup::set_phoneme(
            &lg.protolangs,
            &mut lg.langs[0],
            uuid!("00000000-0000-0000-0000-000000000000"),
            Phoneme::default()
        ),
        false
    );

    lg.protolangs[0].phonemes.insert(
        uuid!("00000000-0000-0000-0000-000000000000"),
        Phoneme::default(),
    );

    assert_eq!(
        LanguageGroup::set_phoneme(
            &lg.protolangs,
            &mut lg.langs[0],
            uuid!("00000000-0000-0000-0000-000000000000"),
            Phoneme::default()
        ),
        true
    );

    with_settings!({sort_maps => true}, {
        assert_yaml_snapshot!(lg);
    })
}

#[test]
fn lg_epoch_preserves_protophonemes_in_language() {
    let mut pre = LanguageGroup {
        family_id: uuid!("00000000-0000-0000-0000-000000000000"),
        protolangs: vec![Protolanguage {
            name: "1".to_string(),
            description: None,
            phonemes: {
                let mut map = HashMap::new();
                map.insert(
                    uuid!("00000000-0000-0000-0000-000000000000"),
                    Phoneme {
                        ortho: "1".to_string(),
                        primary: Phone::Plosive {
                            place: crate::data::PlosivePlace::Bilabial,
                            voiced: false,
                            attachments: HashSet::new(),
                        },
                        allo: vec![],
                    },
                );
                map
            },
        }],
        langs: vec![Language {
            name: "1'".to_string(),
            ancestors: vec!["1".to_string()],
            description: None,
            phonemes: {
                let mut map = HashMap::new();
                map.insert(
                    uuid!("00000000-0000-0000-0000-000000000001"),
                    Phoneme {
                        ortho: "2".to_string(),
                        primary: Phone::Plosive {
                            place: crate::data::PlosivePlace::Bilabial,
                            voiced: true,
                            attachments: HashSet::new(),
                        },
                        allo: vec![],
                    },
                );
                map
            },
        }],
        ..Default::default()
    };

    pre.epoch();

    with_settings!({sort_maps => true}, {
        assert_yaml_snapshot!(pre);
    })
}

#[test]
fn epoch_when_phoneme_and_protophoneme_exist_keeps_phoneme() {
    let mut pre = LanguageGroup {
        family_id: uuid!("00000000-0000-0000-0000-000000000000"),
        protolangs: vec![Protolanguage {
            name: "1".to_string(),
            description: None,
            phonemes: {
                let mut map = HashMap::new();
                map.insert(
                    uuid!("00000000-0000-0000-0000-000000000000"),
                    Phoneme {
                        ortho: "1".to_string(),
                        primary: Phone::Plosive {
                            place: crate::data::PlosivePlace::Bilabial,
                            voiced: false,
                            attachments: HashSet::new(),
                        },
                        allo: vec![],
                    },
                );
                map
            },
        }],
        langs: vec![Language {
            name: "1'".to_string(),
            ancestors: vec!["1".to_string()],
            description: None,
            phonemes: {
                let mut map = HashMap::new();
                map.insert(
                    uuid!("00000000-0000-0000-0000-000000000000"),
                    Phoneme {
                        ortho: "2".to_string(),
                        primary: Phone::Plosive {
                            place: crate::data::PlosivePlace::Bilabial,
                            voiced: true,
                            attachments: HashSet::new(),
                        },
                        allo: vec![],
                    },
                );
                map
            },
        }],
        ..Default::default()
    };

    pre.epoch();

    with_settings!({sort_maps => true}, {
        assert_yaml_snapshot!(pre);
    })
}

#[test]
fn merge_removes_nonexistant_ancestors() {
    // TODO once we start referring to protolanguages,
    // items that reference invalid protolanguages should be wiped!
    let pre = LanguageGroup {
        family_id: uuid!("00000000-0000-0000-0000-000000000000"),
        protolangs: vec![Protolanguage {
            name: "1".to_string(),
            description: None,
            phonemes: HashMap::new(),
        }],
        langs: vec![Language {
            name: "A".to_string(),
            description: None,
            phonemes: HashMap::new(),
            ancestors: vec!["1".to_string()],
        }],
        ..Default::default()
    };

    let post_a = LanguageGroup {
        family_id: uuid!("00000000-0000-0000-0000-000000000000"),
        protolangs: vec![],
        langs: vec![Language {
            name: "2".to_string(),
            description: None,
            phonemes: HashMap::new(),
            ancestors: vec!["H".to_string()],
        }],
        ..Default::default()
    };

    let post_b = LanguageGroup {
        family_id: uuid!("00000000-0000-0000-0000-000000000000"),
        protolangs: vec![],
        langs: vec![Language {
            name: "2".to_string(),
            description: None,
            phonemes: HashMap::new(),
            ancestors: vec!["1".to_string()],
        }],
        ..Default::default()
    };

    with_settings!({sort_maps => true}, {
        assert_yaml_snapshot!({
            let mut pre = pre.clone();
            pre.merge(&post_a);
            pre
        });

        assert_yaml_snapshot!({
            let mut pre = pre.clone();
            pre.merge(&post_b);
            pre
        });
    });
}
