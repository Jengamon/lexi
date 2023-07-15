import { Link, Outlet, useOutletContext, useParams } from "react-router-dom";
import { useState } from "react";
import { Language } from "~/src/data";
import { Array, Record, Static, String } from "runtypes";
import * as classes from "./lang_editor.module.css";
import useSWR from "swr";
import { fetcher, subscribeGenerator } from "~/src/stores";
import { getErrorMessage } from "../util";
import { invoke } from "@tauri-apps/api";
import useSWRSubscription from "swr/subscription";

const LangEditorContext = Record({
    lang: Language,
});
export type LangEditorContext = Static<typeof LangEditorContext>;

export default function LangEditor() {
    const { langId } = useParams();
    const {
        data: langNames,
        error,
    } = useSWRSubscription<string[]>("all_languages", subscribeGenerator(Array(String)));
    const {
        data: lang,
        error: protoError,
        mutate: langMutate,
    } = useSWR<Language | null>(
        [
            "get_language",
            Language.optional(),
            {
                name: langId,
            },
        ],
        fetcher,
    );
    const [newName, setNewName] = useState("");

    async function createLanguage(name: string) {
        await invoke("create_language", { name });

        await langMutate(async () => {
            const langData = await invoke("get_language", { name });
            return Language.check(langData);
        });

        setNewName("");
    }

    async function deleteLanguage(name: string) {
        await invoke("delete_language", { name });

        await langMutate(null);
    }

    let context: LangEditorContext | undefined;
    if (lang == undefined) {
        context = undefined;
    } else {
        context = { lang };
    }

    if (error != undefined) {
        return <p>{getErrorMessage(error)}</p>
    }

    if (protoError != undefined) {
        return <p>{getErrorMessage(protoError)}</p>
    }

    return context !== undefined ? (
        <Outlet context={context} />
    ) : (
        <ul>
            {langNames && langNames.map((lang) => (
                <li key={lang}>
                    {lang}
                    <ul className={classes.langEditorItemNav}>
                        <li>
                            <Link to={`${lang}/ancestry`}>Ancestry</Link>
                        </li>
                        <li>Dialects</li>
                        <li>
                            <Link to={`${lang}/phonemes`}>Phonemes</Link>
                        </li>
                        <li>
                            <Link to={`${lang}/phonotactics`}>
                                Phonotactics
                            </Link>
                        </li>
                        <li>
                            <Link to={`${lang}/lexicon`}>Lexicon</Link>
                        </li>
                        <li>
                            <Link to={`${lang}/builder`}>Builder</Link>
                        </li>
                        <li onClick={() => deleteLanguage(lang)}>
                            <span className={classes.deleteLink}>DELETE</span>
                        </li>
                    </ul>
                </li>
            ))}
            <li>
                <div>
                    <div>
                        <input
                            value={newName}
                            autoCorrect="off"
                            onChange={(ev) => setNewName(ev.target.value)}
                        />
                        {error && (
                            <p style={{ margin: 0, color: "red" }}>{error}</p>
                        )}
                    </div>
                    <button onClick={() => createLanguage(newName)}>
                        Create Language
                    </button>
                </div>
            </li>
        </ul>
    );
}

export function useLangContext() {
    let context = useOutletContext();
    return LangEditorContext.guard(context) ? context : undefined;
}
