import {
    useLanguage,
    useProtolanguage,
} from "~/src/pages/lang_editor";
import { Protolanguage, Language } from "~/src/data";
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

        <Typography variant="body1">
            Cannot edit without an active (proto-)language
        </Typography>
    ) : (

        <Typography variant="body1">
            {JSON.stringify(merged, null, 2)}
        </Typography>
    );
}
