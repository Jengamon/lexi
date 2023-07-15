import { useProtolanguage } from "~/src/views/langproto_editor";
import { useLanguage } from "~/src/views/lang_editor";
import { Protolanguage, Language } from "~/src/data";
import { NavBar } from "~/src/components/navbar";
import { capitalize } from "lodash-es";
import { Typography } from "@mui/material";

export default function PhonemesEditor() {
    const { protolang } = useProtolanguage();
    const { lang } = useLanguage();
    let mode: "protolang" | "lang";
    let merged: Protolanguage | Language | undefined;
    if (protolang === undefined) {
        merged = lang;
        mode = "lang";
    } else {
        merged = protolang;
        mode = "protolang";
    }

    return merged == undefined ? (
        <>
            <NavBar title="Phoneme Editor" />
            <Typography variant="body1">
                Cannot edit without an active (proto-)language
            </Typography>
        </>
    ) : (
        <>
            <NavBar
                title={`${capitalize(merged.name)}'s Phonemes ${
                    mode == "protolang" ? "[Proto]" : ""
                }`}
            />
            <Typography variant="body1">
                {JSON.stringify(merged, null, 2)}
            </Typography>
        </>
    );
}
