import {
    ProtolangEditorContext,
    useProtolangContext,
} from "~/src/views/langproto_editor";
import { LangEditorContext, useLangContext } from "~/src/views/lang_editor";

export default function PhonemesEditor() {
    const protolangContext = useProtolangContext();
    const langContext = useLangContext();
    let merged: ProtolangEditorContext | LangEditorContext | undefined;
    if (protolangContext === undefined) {
        merged = langContext;
    } else {
        merged = protolangContext;
    }

    return <p>{JSON.stringify(merged, null, 2)}</p>;
}
