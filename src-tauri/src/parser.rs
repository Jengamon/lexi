use nom::{
    bytes::complete::take_while1,
    character::complete::{char, none_of},
    sequence::delimited,
    IResult,
};

pub mod environment;
pub mod syllable;
#[cfg(test)]
mod tests;

pub fn phoneme_class(input: &str) -> IResult<&str, char> {
    none_of("_#")(input)
}

pub fn optional_phoneme_class(input: &str) -> IResult<&str, char> {
    delimited(char('('), phoneme_class, char(')'))(input)
}

pub fn literal_orthography(input: &str) -> IResult<&str, &str> {
    delimited(char('{'), take_while1(|c| c != '}'), char('}'))(input)
}
