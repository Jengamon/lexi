import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { useProjectStore } from "~/src/stores";
import { LanguageGroup } from "~/src/data";
import { String, Array, ValidationError } from "runtypes";
import {getErrorMessage} from "~/src/util";

export default function HomePage() {
    const projectName = useProjectStore((proj) => proj.name);
    const project = useProjectStore((proj) => proj.group);
    const setProjectName = useProjectStore((proj) => proj.setName);
    const updateProject = useProjectStore((proj) => proj.updateGroup);
    const [languageGroupNames, setLanguageGroupNames] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(retrieveLanguageGroupNames, []);

    function retrieveLanguageGroupNames() {
        const input = Array(String);
        invoke("get_language_groups", {}).then((groups: unknown) =>
            setLanguageGroupNames(input.check(groups)),
        );
    }

    async function saveProject() {
        try {
            await invoke("save_language_group", {
                filename: projectName,
                langGroup: project,
            });
        } catch (e) {
            setError(getErrorMessage(e));
        }

        // Output that we've succeeded saving
    }

    async function loadProject(name: string) {
        try {
            let project = await invoke("load_language_group", {
                filename: name,
            });
        } catch(e) {
            setError(getErrorMessage(e));
            return;
        }

        try {
            updateProject((_) => LanguageGroup.check(project));
            setProjectName(name);

            // Output that we've succeeded loading
            setError(null);
        } catch (e) {
            const err = e as ValidationError;
            // Handle error (which will only be the runtypes error
            const err_code = err.code;
            const message = err.message;
            const details = err.details;
            console.error("INTERNAL", err_code, message, details);
            setError(message);
        }
    }

    return (
        <div>
            <h1>Home</h1>
            <div>
                <input
                    onChange={(ev) => setProjectName(ev.target.value)}
                    value={projectName}
                />
                <button onClick={saveProject}>
                    Save Project (Language Group)
                </button>
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button onClick={retrieveLanguageGroupNames}>Refresh</button>
            <ul>
                {languageGroupNames.map((name) => (
                    <li key={name} onClick={() => loadProject(name)}>
                        {name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
