use core::fmt;

use nom::{
    branch::alt,
    bytes::complete::take_while1,
    character::{complete::char, streaming::one_of},
    combinator::{map, opt},
    multi::{many0, separated_list1},
    sequence::{delimited, tuple},
    Finish, IResult,
};

use super::{literal_orthography, optional_phoneme_class, phoneme_class};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum EnvironmentData {
    PhonemeClass { class: char, optional: bool },
    Property { name: String, present: bool },
    Orthography(String),
    Referent,
    Boundary,
    Alternatives(Vec<EnvironmentData>),
}

impl fmt::Display for EnvironmentData {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            EnvironmentData::PhonemeClass { class, optional } => {
                if *optional {
                    write!(f, "({class})")
                } else {
                    write!(f, "{class}")
                }
            }
            EnvironmentData::Property { name, present } => {
                if *present {
                    write!(f, "[+{name}]")
                } else {
                    write!(f, "[-{name}]")
                }
            }
            EnvironmentData::Orthography(ortho) => write!(f, "{{{ortho}}}"),
            EnvironmentData::Referent => write!(f, "_"),
            EnvironmentData::Boundary => write!(f, "#"),
            EnvironmentData::Alternatives(alts) => {
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
pub struct Environment(Vec<EnvironmentData>);
#[derive(Debug, thiserror::Error)]
pub enum Error<'a> {
    #[error("environment was incompletely parsed: `{0}` was not parsed")]
    IncompleteParse(&'a str),
    #[error(transparent)]
    Nom(#[from] nom::error::Error<String>),
}

impl Environment {
    pub fn parse(input: &str) -> Result<Self, Error> {
        let (unparsed, env) = environment(input.as_ref())
            .map_err(|e| e.to_owned())
            .finish()?;
        if !unparsed.is_empty() {
            Err(Error::IncompleteParse(input))
        } else {
            Ok(env)
        }
    }

    pub fn pre_referent(&self) -> impl Iterator<Item = &EnvironmentData> {
        self.0
            .iter()
            .take_while(|i| **i != EnvironmentData::Referent)
    }

    pub fn post_referent(&self) -> impl Iterator<Item = &EnvironmentData> {
        self.0
            .iter()
            .skip_while(|i| **i != EnvironmentData::Referent)
            .skip(1) // Skip the referent
    }
}

impl FromIterator<EnvironmentData> for Environment {
    fn from_iter<T: IntoIterator<Item = EnvironmentData>>(iter: T) -> Self {
        Self(iter.into_iter().collect())
    }
}

impl fmt::Display for Environment {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        for data in self.0.iter() {
            write!(f, "{data}")?;
        }
        Ok(())
    }
}

pub fn environment_referent(input: &str) -> IResult<&str, ()> {
    let (input, _) = char('_')(input)?;

    Ok((input, ()))
}

pub fn word_boundary(input: &str) -> IResult<&str, ()> {
    let (input, _) = char('#')(input)?;

    Ok((input, ()))
}

pub fn property(input: &str) -> IResult<&str, (bool, &str)> {
    delimited(
        char('['),
        tuple((
            map(one_of("+-"), |c| c == '+'),
            take_while1(|c: char| c.is_ascii_alphanumeric() || c == '_'),
        )),
        char(']'),
    )(input)
}

pub fn terminal(input: &str) -> IResult<&str, EnvironmentData> {
    alt((
        map(phoneme_class, |pc| EnvironmentData::PhonemeClass {
            class: pc,
            optional: false,
        }),
        map(optional_phoneme_class, |pc| EnvironmentData::PhonemeClass {
            class: pc,
            optional: true,
        }),
        map(literal_orthography, |s| {
            EnvironmentData::Orthography(s.to_string())
        }),
        map(property, |(present, name)| EnvironmentData::Property {
            name: name.to_string(),
            present,
        }),
    ))(input)
}

pub fn alternatives(input: &str) -> IResult<&str, EnvironmentData> {
    map(
        delimited(char('<'), separated_list1(char(','), terminal), char('>')),
        EnvironmentData::Alternatives,
    )(input)
}

pub(super) fn environment(input: &str) -> IResult<&str, Environment> {
    map(
        tuple((
            opt(map(word_boundary, |()| EnvironmentData::Boundary)),
            many0(alt((terminal, alternatives))),
            environment_referent,
            many0(alt((terminal, alternatives))),
            opt(map(word_boundary, |()| EnvironmentData::Boundary)),
        )),
        |(prebound, pre, _, post, postbound)| {
            let mut elements = vec![];
            elements.extend(prebound);
            elements.extend(pre.into_iter());
            elements.push(EnvironmentData::Referent);
            elements.extend(post.into_iter());
            elements.extend(postbound);
            Environment(elements)
        },
    )(input)
}
