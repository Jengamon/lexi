import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { Array, String } from "runtypes";
import { getErrorMessage } from "~/src/util";
import * as classes from "./home.module.css";
import useSWR from "swr";
import { fetcher } from "~/src/stores";
import { Box, Button, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { Page } from "./page";
import { useAppContext } from "../views/app";
import { AddBox, CallSplit, Delete, FileDownload, Save } from "@mui/icons-material";

export default function HomePage() {
    const [languageGroupNames, setLanguageGroupNames] = useState<string[]>([]);
    const { showAppNotification } = useAppContext();

    function createError(error: any) {
        showAppNotification({
            severity: "error",
            message: getErrorMessage(error),
        });
    }

    const {
        data: projectName,
        mutate: nameMutate,
        isLoading: isNameLoading,
    } = useSWR<string>(["get_project_name", String, {}], fetcher);

    const {
        data: familyId,
        isLoading: isFamilyIdLoading,
        mutate: familyIdMutate,
    } = useSWR<string>(["get_family_id", String, {}], fetcher);

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
            showAppNotification({
                severity: "info",
                message: `Saved project ${projectName}`,
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
            await familyIdMutate(async () => await invoke("get_family_id"));
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
            {isNameLoading ? (
                <></>
            ) : (
                <>
                    <Box display="flex">
                        <TextField
                            autoCorrect="off"
                            sx={{ flexGrow: 1 }}
                            size="small"
                            label="Project Name"
                            onChange={(ev) => setProjectName(ev.target.value)}
                            value={projectName}
                        />
                        <Stack alignSelf="center" spacing={1} direction="row" sx={{ mx: 2 }}>
                            <Tooltip title="Save Project">
                                <IconButton onClick={saveProject} aria-label="save">
                                    <Save />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Export Project">
                                <IconButton onClick={exportProject} aria-label="export">
                                    <FileDownload />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="New Project">
                                <IconButton onClick={newProject} aria-label="new"><AddBox /></IconButton>
                            </Tooltip>
                            <Tooltip title="Epoch Project">
                                <IconButton sx={{ transform: "scaleX(-1)" }} onClick={epochProject}>
                                    <CallSplit /></IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                    <Typography sx={{ pt: 2 }} align="center" variant="caption">
                        {isFamilyIdLoading ? "Loading..." : `Family ${familyId}`}
                    </Typography>
                </>
            )
            }
            <List dense>
                {languageGroupNames.map((name) => (
                    <ListItem key={name} secondaryAction={
                        <IconButton edge="end"
                            aria-label="delete"
                            onClick={() => deleteProject(name)}
                        >
                            <Delete />
                        </IconButton>
                    }>
                        <ListItemButton role={undefined}
                            onClick={() => loadProject(name)}
                        >
                            <ListItemText
                                primary={name}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Page >
    );
}
