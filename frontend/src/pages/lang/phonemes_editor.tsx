import {
    useLanguage,
    useLanguageEditorContext,
    useProtolanguage,
} from "~/src/pages/lang_editor";
import { Typography } from "@mui/material";

export default function PhonemesEditor() {
    const { protolang } = useProtolanguage();
    const { lang } = useLanguage();
    const { mode } = useLanguageEditorContext();

    const merged = mode === "protolang" ? protolang : lang;
    return (
        <Typography variant="body1">
            {JSON.stringify(merged, null, 2)}
        </Typography>
    );
}
