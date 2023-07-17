import { Link } from "react-router-dom";
import {
    useLanguage,
    useLanguageEditorContext,
    useProtolanguage,
} from "../lang_editor";
import { Typography } from "@mui/material";

export default function Describer() {
    const { mode } = useLanguageEditorContext();

    const { lang } = useLanguage();
    const { protolang } = useProtolanguage();

    const targets = {
        protolang: [
            {
                loc: "Phonemes",
                href: "phonemes",
            },
            {
                loc: "Phonotactics",
                href: "phonotactics",
            },
            {
                loc: "Lexicon",
                href: "lexicon",
            },
        ],
        lang: [
            {
                loc: "Ancestry",
                href: "ancestry",
            },
            {
                loc: "Dialects",
                href: "dialects",
            },
            {
                loc: "Phonemes",
                href: "phonemes",
            },
            {
                loc: "Phonotactics",
                href: "phonotactics",
            },
            {
                loc: "Lexicon",
                href: "lexicon",
            },
            // ...
            {
                loc: "Builder",
                href: "builder",
            },
        ],
    };

    const name = mode === "protolang" ? protolang?.name : lang?.name;
    // TODO Make this a Lexical editor state
    const description =
        mode === "protolang" ? protolang?.description : lang?.description;

    return (
        <>
            <Typography align="center" variant="h5">
                {name}
            </Typography>
            <Typography>Description</Typography>
            <Typography component="pre" fontFamily="monospace">
                {JSON.stringify(description)}
            </Typography>
            {targets[mode].map((target) => (
                // We are at ":langId/describe", so go up a level
                <Link key={target.loc} to={`../${target.href}`}>
                    {target.loc}
                </Link>
            ))}
        </>
    );
}
