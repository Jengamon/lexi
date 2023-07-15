import { Link, Outlet, useOutletContext, useParams } from "react-router-dom";
import { useState } from "react";
import { Language } from "~/src/data";
import { Array, String } from "runtypes";
import * as classes from "./lang_editor.module.css";
import useSWR, { KeyedMutator } from "swr";
import { fetcher, subscribeGenerator } from "~/src/stores";
import { getErrorMessage } from "../util";
import { invoke } from "@tauri-apps/api";
import useSWRSubscription from "swr/subscription";
import { NavBar } from "../components/navbar";
import { Typography } from "@mui/material";

export function useLanguage() {
    const { langId } = useParams();
    const { data, error, mutate } = useSWR<Language>(
        [
            "get_language",
            Language,
            {
                name: langId,
            },
        ],
        fetcher,
    );

    return {
        lang: data,
        error,
        mutate,
    };
}

export default function LangEditor() {
    const { langId } = useParams();
    const { data: langNames, error } = useSWRSubscription<string[]>(
        "all_languages",
        subscribeGenerator(Array(String)),
    );
    const { error: langError, mutate: langMutate } = useLanguage();
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
    }

    if (error != undefined) {
        return (
            <>
                <NavBar title="Protolanguages" />
                <Typography variant="body1">
                    {getErrorMessage(error)}
                </Typography>
            </>
        );
    }

    if (langError != undefined && langId != undefined) {
        return (
            <>
                <NavBar title="Protolanguages" />
                <Typography variant="body1">
                    {getErrorMessage(langError)}
                </Typography>
            </>
        );
    }

    return langId !== undefined ? (
        <Outlet />
    ) : (
        <>
            <NavBar title="Languages" />
            <ul>
                {langNames &&
                    langNames.map((lang) => (
                        <li key={lang}>
                            {lang}
                            <ul className={classes.langEditorItemNav}>
                                <li>
                                    <Link to={`${lang}/ancestry`}>
                                        Ancestry
                                    </Link>
                                </li>
                                <li>Dialects</li>
                                <li>
                                    <Link to={`${lang}/phonemes`}>
                                        Phonemes
                                    </Link>
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
                                    <span className={classes.deleteLink}>
                                        DELETE
                                    </span>
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
                                <p style={{ margin: 0, color: "red" }}>
                                    {error}
                                </p>
                            )}
                        </div>
                        <button onClick={() => createLanguage(newName)}>
                            Create Language
                        </button>
                    </div>
                </li>
            </ul>
        </>
    );
}
