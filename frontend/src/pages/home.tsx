import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { Array, String } from "runtypes";
import { getErrorMessage } from "~/src/util";
import * as classes from "./home.module.css";
import useSWR from "swr";
import { fetcher } from "~/src/stores";
import {
    Alert,
    Button,
    Container,
    Snackbar,
    TextField,
    Typography,
} from "@mui/material";
import { NavBar } from "~/src/components/navbar";
import { Page } from "./page";

export default function HomePage() {
    const [languageGroupNames, setLanguageGroupNames] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showError, setShowError] = useState<boolean>(false);

    function createError(error: any) {
        setError(getErrorMessage(error));
        setShowError(true);
    }

    const {
        data: projectName,
        error: nameError,
        mutate: nameMutate,
        isLoading,
    } = useSWR<string>(["get_project_name", String, {}], fetcher);

    useEffect(retrieveLanguageGroupNames, []);

    async function setProjectName(to: string) {
        await invoke("set_project_name", {
            name: to,
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
            createError(e);
        }

        // Output that we've succeeded saving
    }

    async function newProject() {
        try {
            await invoke("new_language_group", {});
            await setProjectName("");
            setError(null);
        } catch (e) {
            createError(e);
        }
    }

    async function exportProject() {
        try {
            await invoke("export_language_group", {});
            setError(null);
        } catch (e) {
            createError(e);
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
            createError(e);
        }
    }

    async function deleteProject(name: string) {
        try {
            await invoke("delete_language_group", {
                filename: name,
            });
        } catch (e) {
            createError(e);
            return;
        }

        retrieveLanguageGroupNames();
        setError(null);
    }

    return (
        <Page title="Home">
            {isLoading ? (
                <></>
            ) : (
                <>
                    <div>
                        <TextField
                            onChange={(ev) => setProjectName(ev.target.value)}
                            value={projectName}
                        />
                    </div>
                    <div>
                        <Button onClick={saveProject}>Save Project</Button>
                        <Button onClick={exportProject}>Export Project</Button>
                        <Button onClick={newProject}>New Project</Button>
                    </div>
                </>
            )}
            <Snackbar
                open={showError}
                autoHideDuration={6000}
                onClose={() => setShowError(false)}
            >
                <Alert onClose={() => setShowError(false)} severity="error">
                    Error: {error}
                </Alert>
            </Snackbar>
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
        </Page>
    );
}
