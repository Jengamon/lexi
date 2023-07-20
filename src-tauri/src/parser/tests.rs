use insta::assert_display_snapshot;

use crate::parser::syllable::Syllable;

use super::environment::Environment;

#[test]
fn gestalt_environment() {
    /*
        Environment syntax:
        # - a word boundary
        . - phoneme class
        <.,.> - alternatives
        _ - referent (what is this environment referring to?)
        {ortho} - literal orthography
        [+property_name] - property names (restricted to [A-Za-z0-9_]+)
            - [+prop] means must *have* this [-prop] means must *not* have this
            - applies to the element preceding it.
            - the property should exist for the phoneme class targeted
            - unmatchable if used before anything else (as it doesn't have an element
                to apply a property of)
    */
    let env = Environment::parse("#<{t},K,O[+coronal]>Cc_V[-voiced]");
    assert!(dbg!(&env).is_ok());
    let env = env.unwrap();
    assert_display_snapshot!(env, @"#<{t},K,O[+coronal]>Cc_V[-voiced]");
    assert_display_snapshot!(env.pre_referent().cloned().collect::<Environment>(), @"#<{t},K,O[+coronal]>Cc");
    assert_display_snapshot!(env.post_referent().cloned().collect::<Environment>(), @"V[-voiced]");
}

#[test]
fn gestalt_syllable() {
    /*
        Syllable syntax:
        . - phoneme class
        <.,.> - alternatives
        {ortho} - literal orthography
    */
    let syll = Syllable::parse("(C)(C)VCC<{n},{m}>");
    assert!(syll.is_ok());
    assert_display_snapshot!(syll.unwrap(), @"(C)(C)VCC<{n},{m}>");
}
