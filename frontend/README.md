# Lexi

## Phonemes

All phonemes are uniquely identified by their orthography,
which is a string.

A phoneme consists of an orthography, and as many phones as you want.
To figure out which phone to use in an environment/morpheme, we will use the phonotactics
of a (proto-)language.

## Dialectical variation

Phonemes do not belong to a particular dialect, but
from phonotactics upwards, some objects can belong to dialects, which
are optional extensions of the language file that either add objects
to be included or remove objects from consideration.

To request something like phonotactics, you can specify a dialect name, if none is specified, no dialect information will be included
(the "standard" variety).

## Phonotactics

Determines how phonemes are realized. (NOTE:
This process **can add phones** to a set of phonemes).

Contains phoneme sets (consonant, vowel, nasal, etc.)

Also contains the syllable structure and stress pattern.

Contains environment rules that control how phoneme sets or phonemes
react when preceded or followed by a phoneme, member of a phoneme set, or a
boundary.

### Phoneme Sets

Consist of member phonemes, property names, and a Member Allophone
Property Mapping (MAPM).

The MAPM is a HashMap of `<(property name, phoneme orthography), cellvalue>`
where cellvalue is either `Null` for a mapping of null production,
or `Allophone(usize)` to indicate a certain allophone of the phoneme.

Invalid Allophone indices should be logged, and replaced with the primary allophone (
the one used in the cellvalue is missing)

Then you have an `HashMap<additional property name, Phone>` mapping, which
is added to MAPM of an allophone to get the full production set for environments.

## Lexicon

Contains the morphemes of a (proto-)language.

A morpheme consists of 0 or more phonemes, and as many
meanings as you want to attach.

A meaning can be:
- base - this directly means or connotes X
- derivational - this means or connotes X relative to some input morpheme

Base properties are denotations (what a morpheme literally means),
and connotation (what can this mean indirectly).

Derivational morphology can only *interact* with connotations and denotations,
and can at most have 1 connotational change and 1 denotational change.

We use Rust's `regex` crate internally to handle these changes, so the input for a change is
a regex, and the output is a string with the captures named with `$N` or `$name`

# Morphology

A word part can either be a morpheme marked as "free",
a "compound" made of morpheme,
or a "bound" morpheme. A denotation and a connotation
is associated with the word part from the set that the member morphemes
provide, or they can be explicitly set.

Contains the minimum syllable count setting, and the way to resolve that.

"Bound" morphemes add their properties to the word they are used in, and
can be a member of a syntax set.

Morph sets are how morphemes are combined with other morphemes into words.

Morph sets are formed for:
- Part of Speech: Noun, Verb, Adjective, etc.
- Gender: 6th class, Inanimate, etc.

All morphemes must be part of the available morph sets (if that set is enabled).
Part of Speech cannot be disabled.

# Syntax

How are words put together into sentences?

# Grapheme Mapping

Maps graphemes in certain environments to phonemes or morphemes.

Contains the word boundary character (stored as a unicode codepoint),
and the sentence boundary  character(s).

Word boundary character defaults to `0x200b` (Zero-Width Space).
If the loaded codepoint is invalid, this is what will be used.

# Builder

V1 end-goal: use graphemes to translate from text written in the language
(with custom fonts allowed) to a phonemic and phonetic description
of that text, and possible meanings of that text.

# Ancestry

A language has 0+ protolang ancestors. To inherit from another language, you
must epoch the project to move the data accordingly.

For this reason, languages *do not* duplicate data from protolanguages.
If something exists in both, the one in the language is considered an "override" of the one in the protolanguage specific to the language in question.

To look up something in a language, we first check the language to see if it contains the UUID, then we check all ancestors in specified order.

# TODO

- Idioms and idiomatic expressions
- Syntax
  - Phonotactic rules for allophone variation and morphemes can be marked as part of a dialect
- Tree files (automate the epoch-merge process)
