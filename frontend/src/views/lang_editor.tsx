import { Link, Outlet, useOutletContext, useParams } from "react-router-dom";
import { useProjectStore } from "~/src/stores";
import { useState } from "react";
import { Language } from "~/src/data";
import { Record, Static } from "runtypes";
import * as classes from "./lang_editor.module.css";

const LangEditorContext = Record({
    lang: Language,
});
export type LangEditorContext = Static<typeof LangEditorContext>;

export default function LangEditor() {
    const { langId } = useParams();
    const langs = useProjectStore((proj) => proj.group.langs);
    const updateProject = useProjectStore((proj) => proj.updateGroup);
    const [newName, setNewName] = useState("");
    const [error, setError] = useState<string | null>(null);

    function createLanguage(name: string) {
        updateProject((proj) => {
            if (proj.langs.find((p) => p.name === name) !== undefined) {
                setError("cannot reuse name");
                return proj;
            } else if (name === "") {
                setError("cannot have blank name");
                return proj;
            }

            proj.langs.push({
                // Default protolang goes here.
                name,
                phonemes: [
                    {
                        ortho: "p",
                        primary: {
                            Plosive: {
                                place: "Bilabial",
                                voiced: false,
                                attachments: [],
                            },
                        },
                        allo: [],
                    },
                ],
            });
            setError(null);
            setNewName("");
            return proj;
        });
    }

    function deleteLanguage(name: string) {
        updateProject((proj) => {
            proj.langs = proj.langs.filter((p) => p.name !== name);
            return proj;
        });
    }

    const lang = langs.find((lang) => lang.name === langId);
    let context: LangEditorContext | undefined;
    if (langId !== undefined) {
        if (lang === undefined) {
            throw new Error(`Language ${langId} not found`);
        }
        context = {
            lang,
        };
    } else {
        context = undefined;
    }

    return langId !== undefined ? (
        <Outlet context={context} />
    ) : (
        <ul>
            {langs.map((lang) => (
                <li key={lang.name}>
                    {lang.name}
                    <ul className={classes.langEditorItemNav}>
                        <li>
                            <Link to={`${lang.name}/ancestry`}>Ancestry</Link>
                        </li>
                        <li>Dialects</li>
                        <li>
                            <Link to={`${lang.name}/phonemes`}>Phonemes</Link>
                        </li>
                        <li>
                            <Link to={`${lang.name}/phonotactics`}>
                                Phonotactics
                            </Link>
                        </li>
                        <li>
                            <Link to={`${lang.name}/lexicon`}>Lexicon</Link>
                        </li>
                        <li>
                            <Link to={`${lang.name}/builder`}>Builder</Link>
                        </li>
                        <li onClick={() => deleteLanguage(lang.name)}>
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
