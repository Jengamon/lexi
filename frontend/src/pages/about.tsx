import { useEffect, useState } from "react";
import { useProjectStore } from "~/src/stores";
import * as classes from "./about.module.css";
import { invoke } from "@tauri-apps/api";
import { String } from "runtypes";
import { fromBranner, getErrorMessage } from "~/src/util";

export default function AboutPage() {
    const [showDebug, setShowDebug] = useState(false);
    const name = useProjectStore((proj) => proj.name);
    const project = useProjectStore((proj) => proj.group);
    const [testExport, setTestExport] = useState<
        string | { error: string } | null
    >(null);
    const [brannerInput, setBrannerInput] = useState("");
    const [branner, setBranner] = useState("");

    useEffect(() => {
        fromBranner(brannerInput).then((output) => setBranner(output));
    }, [brannerInput]);

    async function testExportCurrentProject() {
        try {
            const data = await invoke("test_export_language_group", {
                name,
                project,
            });
            setTestExport(String.check(data));
        } catch (e) {
            setTestExport({ error: getErrorMessage(e) });
        }
    }

    return (
        <div>
            <h1>About</h1>
            <p>
                Lexi is about making coming up with conlangs easier by providing
                a programmatic way to store and explore conlangs both
                synchronically and diachronically.
            </p>
            <div>
                <button onClick={() => setShowDebug(!showDebug)}>
                    Show Debug
                </button>
                {showDebug && (
                    <pre className={classes.debug}>
                        <code>{JSON.stringify(project, null, 2)}</code>
                    </pre>
                )}
            </div>
            <div>
                <button onClick={testExportCurrentProject}>Test Export</button>
                {testExport && (
                    <pre className={classes.debug}>
                        {String.guard(testExport) ? (
                            <code>{testExport}</code>
                        ) : (
                            <code className={classes.error}>
                                {testExport.error}
                            </code>
                        )}
                    </pre>
                )}
            </div>
            <div>
                <input
                    autoCorrect="off"
                    value={brannerInput}
                    onChange={(ev) => setBrannerInput(ev.target.value)}
                />
                <p>{branner}</p>
            </div>
        </div>
    );
}
