import {
    AddBox,
    CallSplit,
    Delete,
    FileDownload,
    Merge,
    Save,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Stack,
    TextField,
    Tooltip,
    Typography,
    FormControl,
    Select,
    InputLabel,
    MenuItem,
    FormHelperText,
} from "@mui/material";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { Array, String } from "runtypes";
import { useCheckedInvokeSWR } from "~/src/stores";
import { getErrorMessage } from "~/src/util";
import { useAppContext } from "../views/app";
import { Page } from "./page";

export default function HomePage() {
    const [languageGroupNames, setLanguageGroupNames] = useState<string[]>([]);
    const { showAppNotification } = useAppContext();

    const [showMergeDialog, setShowMergeDialog] = useState(false);
    const [mergeError, setMergeError] = useState<string | null>(null);
    const [mergeSource, setMergeSource] = useState("");

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
    } = useCheckedInvokeSWR(String, "get_project_name", {});

    const {
        data: familyId,
        isLoading: isFamilyIdLoading,
        mutate: familyIdMutate,
    } = useCheckedInvokeSWR(String, "get_family_id", {});

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
            await familyIdMutate(async () => await invoke("get_family_id"));
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
            showAppNotification({
                severity: "info",
                message: "Epoch created",
                action: {
                    label: "Merge",
                    act: () => setShowMergeDialog(true),
                },
            });
        } catch (e) {
            createError(e);
        }
    }

    async function exportProject() {
        try {
            await invoke("export_language_group", {});
            showAppNotification({
                severity: "info",
                message: "Project exported",
            });
        } catch (e) {
            createError(e);
        }
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

    async function mergeProject(name: string) {
        try {
            await invoke("merge_language_group", {
                filename: name,
            });
            setShowMergeDialog(false);
            // again, don't immediately reset state, it ugly
            setTimeout(() => {
                setMergeError(null);
                setMergeSource("");
            }, 100);
        } catch (e) {
            setMergeError(getErrorMessage(e));
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

    const mergeDialog = (
        <Dialog
            open={showMergeDialog}
            onClose={() => {
                setShowMergeDialog(false);
                // Don't immediately clear state, it looks ugly
                setTimeout(() => {
                    setMergeSource("");
                    setMergeError(null);
                }, 100);
            }}
            title="Merge Project"
        >
            <DialogContent>
                <Box sx={{ my: 2, minWidth: 300 }}>
                    <FormControl fullWidth error={Boolean(mergeError)}>
                        <InputLabel id="merge-source-label">
                            Merge Source
                        </InputLabel>
                        <Select
                            labelId="merge-source-label"
                            id="merge-source"
                            value={mergeSource}
                            label="Merge Source"
                            required={true}
                            onChange={(ev) => setMergeSource(ev.target.value)}
                        >
                            {languageGroupNames.map((name) => (
                                <MenuItem key={name} value={name}>
                                    {name}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{mergeError}</FormHelperText>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={async () => await mergeProject(mergeSource)}>
                    Merge
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Page>
            {isNameLoading ? (
                <></>
            ) : (
                <>
                    <Box display={{ xs: "none", sm: "flex" }}>
                        <TextField
                            autoCorrect="off"
                            sx={{ flexGrow: 1 }}
                            size="small"
                            label="Project Name"
                            onChange={(ev) => setProjectName(ev.target.value)}
                            value={projectName}
                        />
                        <Stack
                            alignSelf="center"
                            spacing={1}
                            direction="row"
                            sx={{ mx: 2 }}
                        >
                            <Tooltip title="Save Project">
                                <IconButton
                                    onClick={saveProject}
                                    aria-label="save"
                                >
                                    <Save />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Export Project">
                                <IconButton
                                    onClick={exportProject}
                                    aria-label="export"
                                >
                                    <FileDownload />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="New Project">
                                <IconButton
                                    onClick={newProject}
                                    aria-label="new"
                                >
                                    <AddBox />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Epoch Project">
                                <IconButton
                                    sx={{ transform: "scaleX(-1)" }}
                                    onClick={epochProject}
                                >
                                    <CallSplit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Merge Project">
                                <IconButton
                                    onClick={() => setShowMergeDialog(true)}
                                >
                                    <Merge />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                    <Box display={{ xs: "flex", sm: "none" }} flexDirection="column">
                        <TextField
                            autoCorrect="off"
                            sx={{ flexGrow: 1 }}
                            size="small"
                            label="Project Name"
                            onChange={(ev) => setProjectName(ev.target.value)}
                            value={projectName}
                        />
                        <Stack
                            alignSelf="center"
                            spacing={1}
                            direction="row"
                            sx={{ mx: 2 }}
                        >
                            <Tooltip title="Save Project">
                                <IconButton
                                    onClick={saveProject}
                                    aria-label="save"
                                >
                                    <Save />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Export Project">
                                <IconButton
                                    onClick={exportProject}
                                    aria-label="export"
                                >
                                    <FileDownload />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="New Project">
                                <IconButton
                                    onClick={newProject}
                                    aria-label="new"
                                >
                                    <AddBox />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Epoch Project">
                                <IconButton
                                    sx={{ transform: "scaleX(-1)" }}
                                    onClick={epochProject}
                                >
                                    <CallSplit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Merge Project">
                                <IconButton
                                    onClick={() => setShowMergeDialog(true)}
                                >
                                    <Merge />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                    <Typography sx={{ pt: 2 }} align="center" variant="caption">
                        {isFamilyIdLoading
                            ? "Loading..."
                            : `Family ${familyId}`}
                    </Typography>
                </>
            )}
            <List dense>
                {languageGroupNames.map((name) => (
                    <ListItem
                        key={name}
                        secondaryAction={
                            <Tooltip title="Delete Project">
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => deleteProject(name)}
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        }
                    >
                        <ListItemButton
                            role={undefined}
                            onClick={() => loadProject(name)}
                        >
                            <ListItemText primary={name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            {mergeDialog}
        </Page>
    );
}
