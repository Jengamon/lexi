import {
    useLanguage,
    useLanguageEditorContext,
    useProtolanguage,
} from "~/src/pages/lang_editor";
import {
    Typography,
    Stepper,
    Step,
    StepLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Paper,
    FormControl,
    Select,
    MenuItem,
    Box,
    Tabs,
    Tab,
    PaperProps,
    InputLabel,
    Switch,
    FormControlLabel,
    IconButton,
    Tooltip,
    Fade,
    Chip,
} from "@mui/material";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import {
    Add,
    KeyboardArrowUp,
    BugReport,
    Delete,
    KeyboardArrowDown,
} from "@mui/icons-material";
import { ObstruentAttachment, Phone, Phoneme, PlosivePlace } from "~/src/data";
import { DraftFunction, useImmer } from "use-immer";
import { invoke } from "@tauri-apps/api";
import { String, Array, Tuple, Boolean } from "runtypes";
import { useCheckedInvokeSWR } from "~/src/stores";
import { displayPhone, getErrorMessage } from "~/src/util";
import { produce } from "immer";
import Grid from "@mui/material/Unstable_Grid2";
import { useAppContext } from "~/src/views/app";

type PhoneEditorTabProps = {
    children?: ReactNode;
    index: number;
    value: number;
    phoneText: string;
};

function PhoneEditorTab({
    children,
    index,
    value,
    phoneText,
    ...other
}: PhoneEditorTabProps & PaperProps) {
    return (
        <Paper
            role="tabpanel"
            hidden={value !== index}
            id={`phoneeditor-tabpanel-${index}`}
            aria-labelledby={`phoneeditor-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Fade in={value === index}>
                        <Stack spacing={2}>
                            {children}
                            <Typography align="center" variant="phone">
                                {phoneText}
                            </Typography>
                        </Stack>
                    </Fade>
                </Box>
            )}
        </Paper>
    );
}

function a11yProps(index: number) {
    return {
        id: `phoneeditor-tab-${index}`,
        "aria-controls": `phoneeditor-tabpanel-${index}`,
    };
}

type PhoneEditorProps = {
    phone: Phone;
    phoneText: string;
    updatePhone: (delta: DraftFunction<Phone>) => void;
};

const PHONEEDITOR_MODES = ["Null", "Plosive", "Affricative", "Fricative"];
function PhoneEditor({ phone, phoneText, updatePhone }: PhoneEditorProps) {
    const modeSelect = PHONEEDITOR_MODES.findIndex((key) => {
        return Object.keys(phone).includes(key) || phone == key;
    });
    return (
        <Box width={1}>
            <Box borderBottom={1} borderColor="divider">
                <Tabs
                    variant="scrollable"
                    value={modeSelect}
                    onChange={async (_ev, value) => {
                        switch (value) {
                            case 0:
                                updatePhone(() => "Null");
                                break;
                            case 1:
                                updatePhone(() => {
                                    return {
                                        Plosive: {
                                            place: "Bilabial",
                                            voiced: false,
                                            attachments: [],
                                        },
                                    } as Phone;
                                });
                                break;
                            default:
                        }
                    }}
                >
                    {PHONEEDITOR_MODES.map((mode, index) => (
                        <Tab label={mode} key={mode} {...a11yProps(index)} />
                    ))}
                </Tabs>
            </Box>
            <PhoneEditorTab
                elevation={2}
                value={modeSelect}
                phoneText={phoneText}
                index={0}
            />
            <PhoneEditorTab
                elevation={2}
                value={modeSelect}
                phoneText={phoneText}
                index={1}
            >
                {typeof phone != "string" && "Plosive" in phone && (
                    <>
                        <FormControl fullWidth>
                            <InputLabel id="plosive-place-label">
                                Place
                            </InputLabel>
                            <Select
                                labelId="plosive-place-label"
                                label="Place"
                                value={phone.Plosive.place}
                                onChange={async (ev) =>
                                    updatePhone((draft) => {
                                        if (
                                            typeof draft != "string" &&
                                            "Plosive" in draft
                                        ) {
                                            draft.Plosive.place =
                                                PlosivePlace.check(
                                                    ev.target.value,
                                                );
                                        }
                                        return draft;
                                    })
                                }
                            >
                                {PlosivePlace.alternatives.map((alt) => (
                                    <MenuItem value={alt.value} key={alt.value}>
                                        {alt.value}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={phone.Plosive.voiced}
                                    onChange={async () =>
                                        updatePhone((draft) => {
                                            if (
                                                typeof draft != "string" &&
                                                "Plosive" in draft
                                            ) {
                                                draft.Plosive.voiced =
                                                    !draft.Plosive.voiced;
                                            }
                                            return draft;
                                        })
                                    }
                                />
                            }
                            label={phone.Plosive.voiced ? "Voiced" : "Unvoiced"}
                        />
                        <Stack
                            spacing={2}
                            direction="row"
                            useFlexGap
                            sx={{ flexWrap: "wrap" }}
                        >
                            {ObstruentAttachment.alternatives.map((alt) => (
                                <Chip
                                    key={alt.value}
                                    label={alt.value}
                                    variant={
                                        phone.Plosive.attachments.includes(
                                            alt.value,
                                        )
                                            ? "outlined"
                                            : undefined
                                    }
                                    onClick={
                                        phone.Plosive.attachments.includes(
                                            alt.value,
                                        )
                                            ? undefined
                                            : async () => {
                                                updatePhone((draft) => {
                                                    if (
                                                        typeof draft !=
                                                        "string" &&
                                                        "Plosive" in draft
                                                    ) {
                                                        draft.Plosive.attachments.push(
                                                            alt.value,
                                                        );
                                                    }
                                                    return draft;
                                                });
                                            }
                                    }
                                    onDelete={
                                        phone.Plosive.attachments.includes(
                                            alt.value,
                                        )
                                            ? async () => {
                                                updatePhone((draft) => {
                                                    if (
                                                        typeof draft !=
                                                        "string" &&
                                                        "Plosive" in draft
                                                    ) {
                                                        draft.Plosive.attachments =
                                                            draft.Plosive.attachments.filter(
                                                                (a) =>
                                                                    a !==
                                                                    alt.value,
                                                            );
                                                    }
                                                    return draft;
                                                });
                                            }
                                            : undefined
                                    }
                                />
                            ))}
                        </Stack>
                    </>
                )}
            </PhoneEditorTab>
        </Box>
    );
}

type PhonemeEditorToolProps = {
    phoneme: Phoneme;
    updatePhoneme: (delta: DraftFunction<Phoneme>) => Promise<boolean>;
};

function PhonemeEditorTool({ phoneme, updatePhoneme }: PhonemeEditorToolProps) {
    const [allophoneIPA, updateAllophoneIPA] = useImmer<string[]>([]);
    const [primaryIPA, setPrimaryIPA] = useState("");
    const [selectedPhone, setSelectedPhone] = useState<number | null>(null);
    const [editedAllophone, updateEditedAllophone] = useImmer<{
        phone: Phone;
        source?: number;
    } | null>(null);
    const [editedAllophoneIPA, setEditedAllophoneIPA] = useState("");

    useEffect(() => {
        (async () => {
            const draft: string[] = [];
            for (const allo of phoneme.allo) {
                draft.push(await displayPhone(allo));
            }
            updateAllophoneIPA(draft);
        })();
        displayPhone(phoneme.primary).then((ipa) => setPrimaryIPA(ipa));
    });

    async function commitEditedAllophone(target: number | null) {
        if (editedAllophone !== null) {
            const editedIPA = await displayPhone(editedAllophone.phone);
            await updatePhoneme((draft) => {
                if (editedAllophone.source !== undefined) {
                    const source = editedAllophone.source;
                    draft.allo[source] = editedAllophone.phone;
                    updateAllophoneIPA((draft) => {
                        draft[source] = editedIPA;
                        return draft;
                    });
                } else {
                    draft.primary = editedAllophone.phone;
                    setPrimaryIPA(editedIPA);
                }
                return draft;
            });
        }
        setSelectedPhone(target);
        setEditedAllophoneIPA("");
        updateEditedAllophone(null);
    }

    async function editPhone(delta: DraftFunction<Phone>, source?: number) {
        const mod = produce(
            editedAllophone?.phone ??
            (source !== undefined ? phoneme.allo[source] : phoneme.primary),
            delta,
        );
        const ipa = await displayPhone(mod);
        updateEditedAllophone((draft) => {
            if (draft === null) {
                draft = {
                    source,
                    phone: mod,
                };
            } else {
                draft.phone = mod;
            }
            return draft;
        });
        setEditedAllophoneIPA(ipa);
    }

    return (
        <Grid container spacing={2}>
            <Grid xs={4} sx={{ height: 1 }}>
                <Paper sx={{ p: 2 }}>
                    <Stack direction="column" spacing={2}>
                        <TextField
                            label="Orthography"
                            inputProps={{
                                autoCorrect: "off",
                            }}
                            value={phoneme.ortho}
                            onChange={async (ev) =>
                                await updatePhoneme((draft) => {
                                    draft.ortho = ev.target.value;
                                    return draft;
                                })
                            }
                        />
                        <List
                            sx={{
                                "& .MuiListItemText-primary": {
                                    fontFamily: "Iosevka Web",
                                },
                            }}
                        >
                            {editedAllophone !== null && (
                                <ListItem
                                    key="edited"
                                    secondaryAction={
                                        <Tooltip title="Cancel">
                                            <IconButton
                                                edge="end"
                                                aria-label="cancel"
                                                onClick={() =>
                                                    updateEditedAllophone(null)
                                                }
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                >
                                    <ListItemButton
                                        onClick={async () =>
                                            await commitEditedAllophone(
                                                editedAllophone.source ?? null,
                                            )
                                        }
                                    >
                                        <ListItemText
                                            sx={{
                                                color: "warning.main",
                                            }}
                                            primary={editedAllophoneIPA}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            )}
                            <ListItem key="primary">
                                <ListItemButton
                                    selected={selectedPhone === null}
                                    onClick={() => commitEditedAllophone(null)}
                                >
                                    <ListItemText
                                        sx={{
                                            color: "secondary.main",
                                        }}
                                        primary={primaryIPA}
                                    />
                                </ListItemButton>
                            </ListItem>
                            {allophoneIPA
                                .map(
                                    (ipa, index) =>
                                        [phoneme.allo[index], ipa] as const,
                                )
                                .map(([phone, ipa], index) => (
                                    <ListItem
                                        key={index}
                                        secondaryAction={
                                            phone !== "Null" ? (
                                                <Tooltip title="Make Primary">
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="make-primary"
                                                        onClick={async () => {
                                                            await updatePhoneme(
                                                                (draft) => {
                                                                    let oprim =
                                                                        draft.primary;
                                                                    draft.primary =
                                                                        phone;
                                                                    draft.allo[
                                                                        index
                                                                    ] = oprim;
                                                                    return draft;
                                                                },
                                                            );
                                                            setSelectedPhone(
                                                                null,
                                                            );
                                                        }}
                                                    >
                                                        <KeyboardArrowUp />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="delete"
                                                        onClick={async () => {
                                                            await updatePhoneme(
                                                                (draft) => {
                                                                    draft.allo.splice(
                                                                        index,
                                                                        1,
                                                                    );
                                                                    return draft;
                                                                },
                                                            );
                                                        }}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            )
                                        }
                                    >
                                        <ListItemButton
                                            selected={selectedPhone === index}
                                            onClick={() =>
                                                commitEditedAllophone(index)
                                            }
                                        >
                                            <ListItemText primary={ipa} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                        </List>
                    </Stack>
                    <Button
                        fullWidth
                        onClick={() =>
                            updatePhoneme((draft) => {
                                draft.allo.push("Null");
                                return draft;
                            })
                        }
                    >
                        <Add /> Add Null
                    </Button>
                </Paper>
            </Grid>
            <Grid xs={8} sx={{ height: 1 }}>
                {editedAllophone !== null ? (
                    <PhoneEditor
                        phone={editedAllophone.phone}
                        phoneText={editedAllophoneIPA}
                        updatePhone={async (delta) => await editPhone(delta)}
                    />
                ) : selectedPhone !== null &&
                    selectedPhone < phoneme.allo.length ? (
                    <PhoneEditor
                        phone={phoneme.allo[selectedPhone]}
                        phoneText={allophoneIPA[selectedPhone]}
                        updatePhone={async (delta) =>
                            await editPhone(delta, selectedPhone)
                        }
                    />
                ) : (
                    <PhoneEditor
                        phone={phoneme.primary}
                        phoneText={primaryIPA}
                        updatePhone={async (delta) => await editPhone(delta)}
                    />
                )}
            </Grid>
        </Grid>
    );
}

export default function PhonemesEditor() {
    const { protolang, mutate: protolangMutate } = useProtolanguage();
    const { lang, mutate: langMutate } = useLanguage();
    const { mode } = useLanguageEditorContext();
    const [showDebugDialog, setShowDebugDialog] = useState(false);
    const [selectedPhoneme, setSelectedPhoneme] = useState<string | null>(null);
    const { showAppNotification } = useAppContext();

    const {
        data: phonemes,
        mutate: phonemesMutate,
        error: phonemesError,
    } = useCheckedInvokeSWR(Array(Tuple(String, Phoneme)), "get_phonemes", {
        name: mode === "protolang" ? protolang?.name : lang?.name,
        nameType: mode === "protolang" ? "Protolanguage" : "Language",
    });

    async function createPhoneme() {
        const phoneme: Phoneme = {
            ortho: "",
            allo: ["Null"],
            primary: "Null",
        };

        const create =
            mode === "protolang"
                ? "create_protolanguage_phoneme"
                : "create_language_phoneme";
        const id = String.check(
            await invoke(create, {
                name: mode === "protolang" ? protolang?.name : lang?.name,
                phoneme,
            }),
        );

        return await phonemesMutate(async (state) => {
            const block: [string, Phoneme] = [id, phoneme];
            const modded = state !== undefined ? [...state, block] : [block];
            if (mode === "protolang") {
                await protolangMutate();
            } else if (mode == "lang") {
                await langMutate();
            }
            setSelectedPhoneme(id);
            return modded;
        });
    }

    async function deletePhoneme() {
        selectedPhoneme !== null
            ? await invoke("delete_phoneme", {
                name: mode === "protolang" ? protolang?.name : lang?.name,
                nameType: mode === "protolang" ? "Protolanguage" : "Language",
                id: selectedPhoneme,
            })
            : null;
        setSelectedPhoneme(null);
        await phonemesMutate();
        mode === "protolang" ? await protolangMutate() : await langMutate();
    }

    async function updatePhoneme(
        id: string,
        base: Phoneme,
        delta: DraftFunction<Phoneme>,
    ) {
        try {
            let res = await invoke("set_phoneme", {
                name: mode === "protolang" ? protolang?.name : lang?.name,
                nameType: mode === "protolang" ? "Protolanguage" : "Language",
                id,
                phoneme: produce(base, delta),
            });
            await phonemesMutate();
            mode === "protolang" ? await protolangMutate() : await langMutate();
            return Boolean.check(res);
        } catch (e) {
            showAppNotification({
                severity: "error",
                message: `Error editing phoneme: ${getErrorMessage(e)}`,
            });
            return false;
        }
    }

    let toolbar = (
        <Stack spacing={2} direction="row">
            <Button variant="contained" onClick={createPhoneme}>
                <Add /> Create New
            </Button>
            <Button
                variant="contained"
                disabled={selectedPhoneme === null}
                onClick={deletePhoneme}
            >
                <Delete /> Delete Current
            </Button>
            <Button
                variant="contained"
                onClick={() => setShowDebugDialog(true)}
            >
                <BugReport /> Debug
            </Button>
            {mode === "lang" && (
                <Button variant="contained">
                    <KeyboardArrowDown /> Inherit
                </Button>
            )}
        </Stack>
    );

    const merged = mode === "protolang" ? protolang : lang;

    const debugDialog = (
        <Dialog
            open={showDebugDialog}
            onClose={() => setShowDebugDialog(false)}
            scroll="paper"
        >
            <DialogTitle>Debug</DialogTitle>
            <DialogContent>
                <Paper component="pre">
                    <Typography fontFamily="monospace">
                        {JSON.stringify(merged, null, 2)}
                    </Typography>
                </Paper>
            </DialogContent>
        </Dialog>
    );

    return (
        <Stack spacing={2}>
            {toolbar}
            {debugDialog}
            {phonemesError !== undefined
                ? getErrorMessage(phonemesError)
                : null}
            {phonemes !== undefined && (
                <FormControl fullWidth>
                    <InputLabel id="phoneme-select-label">Phoneme</InputLabel>
                    <Select
                        labelId="phoneme-select-label"
                        label="Phoneme"
                        value={selectedPhoneme ?? ""}
                        onChange={(ev) =>
                            setSelectedPhoneme(ev.target.value ?? null)
                        }
                    >
                        <MenuItem value={undefined}>
                            No Phoneme Selected
                        </MenuItem>
                        {phonemes.map(([id, data]) => (
                            <MenuItem value={id} key={id}>
                                &#123;{data.ortho}&#125; ({id})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}
            {selectedPhoneme !== null && merged !== undefined && (
                <PhonemeEditorTool
                    phoneme={merged.phonemes[selectedPhoneme]}
                    updatePhoneme={async (delta) =>
                        await updatePhoneme(
                            selectedPhoneme,
                            merged.phonemes[selectedPhoneme],
                            delta,
                        )
                    }
                />
            )}
        </Stack>
    );
}
