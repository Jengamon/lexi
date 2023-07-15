import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { Array, String } from "runtypes";
import { getErrorMessage } from "~/src/util";
import * as classes from "./home.module.css";
import useSWR from "swr";
import { fetcher } from "~/src/stores";

export default function HomePage() {
    const [languageGroupNames, setLanguageGroupNames] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const {
        data: projectName,
        error: nameError,
        mutate: nameMutate,
        isLoading,
    } = useSWR<string>(["get_project_name", String, {}], fetcher);

    useEffect(retrieveLanguageGroupNames, []);

    async function setProjectName(to: string) {
        await invoke("set_project_name", {
            name: to
        });
        await nameMutate(to);
    }

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
            });
            retrieveLanguageGroupNames();
            setError(null);
        } catch (e) {
            setError(getErrorMessage(e));
        }

        // Output that we've succeeded saving
    }

    async function newProject() {
        try {
            await invoke("new_language_group", {});
            setError(null);
        } catch (e) {
            setError(getErrorMessage(e));
        }
    }

    async function exportProject() {
        try {
            await invoke("export_language_group", {});
            setError(null);
        } catch (e) {
            setError(getErrorMessage(e));
        }

        // Output that we've succeeded saving
    }

    async function loadProject(name: string) {
        try {
            await invoke("load_language_group", {
                filename: name,
            });
            await nameMutate(name);
            setError(null);
        } catch (e) {
            setError(getErrorMessage(e));
            return;
        }
    }

    async function deleteProject(name: string) {
        try {
            await invoke("delete_language_group", {
                filename: name,
            });
        } catch (e) {
            setError(getErrorMessage(e));
            return;
        }

        retrieveLanguageGroupNames();
        setError(null);
    }

    if (isLoading) {
        return (
            <div>
                <h1>Home</h1>
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div>
            <h1>Home</h1>
            <div>
                <input
                    autoCorrect="off"
                    onChange={(ev) => setProjectName(ev.target.value)}
                    value={projectName}
                />
                <button onClick={saveProject}>
                    Save Project (Language Group)
                </button>
                <button onClick={exportProject}>
                    Export Project (Language Group)
                </button>
                <button onClick={newProject}>
                    New Project (Language Group)
                </button>
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button onClick={retrieveLanguageGroupNames}>Refresh</button>
            <ul>
                {languageGroupNames.map((name) => (
                    <li key={name}>
                        <div className={classes.langNameItem}>
                            <div
                                className="label"
                                onClick={() => loadProject(name)}
                            >
                                {name}
                            </div>
                            <div
                                className={classes.remove}
                                onClick={() => deleteProject(name)}
                            >
                                DELETE
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
