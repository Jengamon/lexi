# Lexi

## Phonemes

All phonemes are uniquely identified by their orthography,
which is a string.

A phoneme consists of an orthography, and as many phones as you want.
To figure out which phone to use in an environment/morpheme, we will use the phonotactics
of a (proto-)language.

## Phonotactics

Determines how phonemes are realized. (NOTE: 
This process **can add phones** to a set of phonemes).

Contains phoneme sets (consonant, vowel, nasal, etc.)

Also contains the syllable structure and stress pattern.

Contains environment rules that control how phoneme sets or phonemes
react when preceded or followed by a phoneme, member of a phoneme set, or a
boundary.


## Lexicon

Contains the morphemes of a (proto-)language.

A morpheme consists of 0 or more phonemes, and as many
meaning sets as you want to attach.

A meaning set can be:
- base - this directly means X
- derivational - this means X relative to some input morpheme
- inflectional - this changes a property for an input morpheme

This is also where you define properties of your lexicon,
which determines the information that base sets can carry.
Base properties are denotations (what a morpheme literally means),
and connotation (what can this mean indirectly).

Examples of properties that can be added to a lexicon are:
- part of speech (Noun, Verb, Adjective, etc.)
- gender (Inanimate, Animate, Feminine, 6th class - monetary objects, etc.)
  - part of speech determines whether this is active for a morpheme
- stress - If a stress level is marked as "manual", you can select as syllable for that stress level

Derivational morphology can only *interact* with connotations and denotations,
and can at most have 1 connotational change and 1 denotational change.

We use Rust's `regex` crate internally to handle these changes, so the input for a change is
a regex, and the output is a string with the captures named with `$N` or `$name`

# TODO

- Idioms and idiomatic expressions
- Syntax
- Dialects
  - Phonotactic rules for allophone variation and morphemes can be marked as part of a dialect
