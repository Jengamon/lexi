import { Link, Outlet, useOutletContext, useParams } from "react-router-dom";
// import { useProjectStore } from "~/src/stores";
import { useState } from "react";
import { Protolanguage } from "~/src/data";
import { Record, Static } from "runtypes";
import * as classes from "./langproto_editor.module.css";
import { fetcher } from "~/src/stores";
import useSWR from "swr";
import { getErrorMessage } from "../util";

const ProtolangEditorContext = Record({
    lang: Protolanguage,
});
export type ProtolangEditorContext = Static<typeof ProtolangEditorContext>;

export default function ProtolangEditor() {
    const { langId } = useParams();
    const {
        data: protoNames,
        error,
        isLoading,
    } = useSWR<string[]>(["get_protolanguages", Array(String), {}], fetcher);
    const {
        data: proto,
        error: langError,
        mutate: langMutate,
    } = useSWR<Protolanguage | null>(
        [
            "get_protolanguage",
            Protolanguage.optional(),
            {
                name: langId,
            },
        ],
        fetcher,
    );
    const [newName, setNewName] = useState("");

    function createProtolanguage(name: string) {

    }

    function deleteProtolanguage(name: string) {

    }

    // const proto = protos.find((lang) => lang.name === langId);
    let context: ProtolangEditorContext | undefined;
    if (proto == undefined) {
        context = undefined;
    } else {
        context = { lang: proto };
    }

    if (error != undefined) {
        return <p>{getErrorMessage(error)}</p>
    }

    if (langError != undefined) {
        return <p>{getErrorMessage(langError)}</p>
    }

    return context !== undefined ? (
        <Outlet context={context} />
    ) : (
        <ul>
            {protoNames && protoNames.map((proto) => (
                <li key={proto}>
                    {proto}
                    <ul className={classes.protolangEditorItemNav}>
                        <li>
                            <Link to={`${proto}/phonemes`}>Phonemes</Link>
                        </li>
                        <li>
                            <Link to={`${proto}/phonotactics`}>
                                Phonotactics
                            </Link>
                        </li>
                        <li>
                            <Link to={`${proto}/lexicon`}>Lexicon</Link>
                        </li>
                        <li>
                            <Link to={`${proto}/builder`}>Builder</Link>
                        </li>
                        <li onClick={() => deleteProtolanguage(proto)}>
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
                    <button onClick={() => createProtolanguage(newName)}>
                        Create Protolanguage
                    </button>
                </div>
            </li>
        </ul>
    );
}

export function useProtolangContext() {
    const data = useOutletContext();
    return ProtolangEditorContext.guard(data) ? data : undefined;
}
