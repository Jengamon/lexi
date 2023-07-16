import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { Array, String } from "runtypes";
import { getErrorMessage } from "~/src/util";
import * as classes from "./home.module.css";
import useSWR from "swr";
import { fetcher } from "~/src/stores";
import {
    Button,
    TextField,
    Typography,
} from "@mui/material";
import { Page } from "./page";
import { useAppContext } from "../views/app";

export default function HomePage() {
    const [languageGroupNames, setLanguageGroupNames] = useState<string[]>([]);
    const { showAppNotification } = useAppContext();

    function createError(error: any) {
        showAppNotification({
            severity: "error",
            message: getErrorMessage(error)
        })
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
        } catch (e) {
            createError(e);
        }

        // Output that we've succeeded saving
    }

    async function newProject() {
        try {
            await invoke("new_language_group", {});
            await setProjectName("");
        } catch (e) {
            createError(e);
        }
    }

    async function epochProject() {
        try {
            await invoke("epoch_language_group", {});
            await nameMutate(async () => {
                return await invoke("get_project_name", {});
            });
        } catch (e) {
            createError(e);
        }
    }

    async function exportProject() {
        try {
            await invoke("export_language_group", {});
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
                        <Button onClick={epochProject}>Epoch Project</Button>
                    </div>
                </>
            )}
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
