use core::fmt;

use nom::{
    branch::alt,
    character::complete::char,
    combinator::map,
    multi::{many1, separated_list1},
    sequence::delimited,
    Finish, IResult,
};

use super::{literal_orthography, optional_phoneme_class, phoneme_class};

#[derive(Debug, Clone)]
pub enum SyllableData {
    PhonemeClass { class: char, optional: bool },
    Orthography(String),
    Alternatives(Vec<SyllableData>),
}

impl fmt::Display for SyllableData {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SyllableData::PhonemeClass { class, optional } => {
                if *optional {
                    write!(f, "({class})")
                } else {
                    write!(f, "{class}")
                }
            }
            SyllableData::Orthography(ortho) => write!(f, "{{{ortho}}}"),
            SyllableData::Alternatives(alts) => {
                write!(f, "<")?;
                if let Some(falt) = alts.get(0) {
                    write!(f, "{falt}")?;
                }
                for oalt in alts.iter().skip(1) {
                    write!(f, ",{oalt}")?;
                }
                write!(f, ">")
            }
        }
    }
}

#[derive(Debug, Clone)]
pub struct Syllable(Vec<SyllableData>);
#[derive(Debug, thiserror::Error)]
pub enum Error<'a> {
    #[error("syllable structure was incompletely parsed: `{0}` was not parsed")]
    IncompleteParse(&'a str),
    #[error(transparent)]
    Nom(#[from] nom::error::Error<String>),
}

impl Syllable {
    pub fn parse(input: &str) -> Result<Self, Error> {
        let (unparsed, syll) = syllable(input).map_err(|e| e.to_owned()).finish()?;
        if !unparsed.is_empty() {
            Err(Error::IncompleteParse(unparsed))
        } else {
            Ok(syll)
        }
    }

    pub fn data(&self) -> impl Iterator<Item = &SyllableData> {
        self.0.iter()
    }
}

impl FromIterator<SyllableData> for Syllable {
    fn from_iter<T: IntoIterator<Item = SyllableData>>(iter: T) -> Self {
        Self(iter.into_iter().collect())
    }
}

impl fmt::Display for Syllable {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        for data in self.0.iter() {
            write!(f, "{data}")?;
        }
        Ok(())
    }
}

pub fn terminal(input: &str) -> IResult<&str, SyllableData> {
    alt((
        map(phoneme_class, |pc| SyllableData::PhonemeClass {
            class: pc,
            optional: false,
        }),
        map(optional_phoneme_class, |pc| SyllableData::PhonemeClass {
            class: pc,
            optional: true,
        }),
        map(literal_orthography, |s| {
            SyllableData::Orthography(s.to_string())
        }),
    ))(input)
}

pub fn alternatives(input: &str) -> IResult<&str, SyllableData> {
    map(
        delimited(char('<'), separated_list1(char(','), terminal), char('>')),
        SyllableData::Alternatives,
    )(input)
}

pub(super) fn syllable(input: &str) -> IResult<&str, Syllable> {
    map(many1(alt((terminal, alternatives))), Syllable)(input)
}
