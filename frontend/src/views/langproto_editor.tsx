import { Link, Outlet, useOutletContext, useParams } from "react-router-dom";
import { useProjectStore } from "~/src/stores";
import { useState } from "react";
import { Protolanguage } from "~/src/data";
import { Record, Static } from "runtypes";
import * as classes from "./langproto_editor.module.css";

const ProtolangEditorContext = Record({
    lang: Protolanguage,
});
export type ProtolangEditorContext = Static<typeof ProtolangEditorContext>;

export default function ProtolangEditor() {
    const { langId } = useParams();
    const protos = useProjectStore((proj) => proj.group.protolangs);
    const updateProject = useProjectStore((proj) => proj.updateGroup);
    const [newName, setNewName] = useState("");
    const [error, setError] = useState<string | null>(null);

    function createProtolanguage(name: string) {
        updateProject((proj) => {
            if (proj.protolangs.find((p) => p.name === name) !== undefined) {
                setError("cannot reuse name");
                return proj;
            } else if (name === "") {
                setError("cannot have blank name");
                return proj;
            }

            proj.protolangs.push({
                // Default protolang goes here.
                name,
                phonemes: [],
            });
            setError(null);
            setNewName("");
            return proj;
        });
    }

    function deleteProtolanguage(name: string) {
        updateProject((proj) => {
            proj.protolangs = proj.protolangs.filter((p) => p.name !== name);
            return proj;
        });
    }

    const proto = protos.find((lang) => lang.name === langId);
    let context: ProtolangEditorContext | undefined;
    if (langId !== undefined) {
        if (proto === undefined) {
            throw new Error(`Proto-language ${langId} not found`);
        }
        context = {
            lang: proto,
        };
    } else {
        context = undefined;
    }

    return langId !== undefined ? (
        <Outlet context={context} />
    ) : (
        <ul>
            {protos.map((proto) => (
                <li key={proto.name}>
                    {proto.name}
                    <ul className={classes.protolangEditorItemNav}>
                        <li>
                            <Link to={`${proto.name}/phonemes`}>Phonemes</Link>
                        </li>
                        <li>
                            <Link to={`${proto.name}/phonotactics`}>
                                Phonotactics
                            </Link>
                        </li>
                        <li>
                            <Link to={`${proto.name}/lexicon`}>Lexicon</Link>
                        </li>
                        <li>
                            <Link to={`${proto.name}/builder`}>Builder</Link>
                        </li>
                        <li onClick={() => deleteProtolanguage(proto.name)}>
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
