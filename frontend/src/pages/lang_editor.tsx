import {
    Add,
    Create,
    Delete,
    Toc,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    TextField,
    Toolbar,
    Typography,
    SpeedDial,
    SpeedDialIcon,
    SpeedDialAction,
} from "@mui/material";
import { invoke } from "@tauri-apps/api";
import { useState } from "react";
import {
    Link,
    Outlet,
    useNavigate,
    useOutlet,
    useOutletContext,
    useParams,
} from "react-router-dom";
import { Array, String } from "runtypes";
import useSWR, { KeyedMutator } from "swr";
import useSWRSubscription from "swr/subscription";
import { Language, Protolanguage } from "~/src/data";
import { fetcher, subscribeGenerator } from "~/src/stores";
import { NavBar } from "../components/navbar";
import { getErrorMessage } from "../util";
import { useAppContext } from "../views/app";
import { Page } from "./page";

export function useProtolanguage() {
    const { plangId } = useParams();
    const { data, error, mutate } = useSWR<Protolanguage>(
        [
            "get_protolanguage",
            Protolanguage,
            {
                name: plangId,
            },
        ],
        fetcher,
    );

    return {
        protolang: data,
        error,
        mutate,
    };
}

export function useLanguage() {
    const { langId } = useParams();
    const { data, error, mutate } = useSWR<Language>(
        [
            "get_language",
            Language,
            {
                name: langId,
            },
        ],
        fetcher,
    );

    return {
        lang: data,
        error,
        mutate,
    };
}

export type LanguageEditorContext = {
    mode: "protolang" | "lang";
};

export function useLanguageEditorContext() {
    return useOutletContext<LanguageEditorContext>();
}

export type LanguageEditorProps = {
    mode: "lang" | "protolang";
};

export function LanguageEditor({ mode }: LanguageEditorProps) {
    const { data: protoNames, error: protoError } = useSWRSubscription<
        string[]
    >("all_protolanguages", subscribeGenerator(Array(String)));
    const { data: langNames, error: langError } = useSWRSubscription<string[]>(
        "all_languages",
        subscribeGenerator(Array(String)),
    );
    const { error: dataError, mutate: langMutate } = useLanguage();
    const { error: protoDataError, mutate: protoMutate } = useProtolanguage();
    const { langId, plangId } = useParams();

    return mode === "protolang" ? (
        <LanguageEditorInner
            mode={mode}
            names={protoNames}
            error={protoError}
            langMutate={() => {
                throw new Error("lang mutated in protolang mode");
            }}
            protolangMutate={protoMutate}
            langId={plangId}
            langError={protoDataError}
        />
    ) : (
        <LanguageEditorInner
            mode={mode}
            names={langNames}
            error={langError}
            langMutate={langMutate}
            protolangMutate={() => {
                throw new Error("protolang mutated in lang mode");
            }}
            langId={langId}
            langError={dataError}
        />
    );
}

type LanguageEditorInnerProps = {
    langId?: string;
    names?: string[];
    error: any;
    langMutate: KeyedMutator<Language>;
    protolangMutate: KeyedMutator<Protolanguage>;
    langError: any;
};

function LanguageEditorInner({
    mode,
    names,
    error,
    langMutate,
    protolangMutate,
    langError,
    langId,
}: LanguageEditorProps & LanguageEditorInnerProps) {
    const [newName, setNewName] = useState("");
    const [createError, setCreateError] = useState<string | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    const { showAppNotification } = useAppContext();
    const navigate = useNavigate();

    async function create(name: string) {
        try {
            const create =
                mode === "protolang"
                    ? "create_protolanguage"
                    : "create_language";
            const get =
                mode === "protolang" ? "get_protolanguage" : "get_language";
            const noun = mode === "protolang" ? "protolanguage" : "language";
            const prefix = mode === "protolang" ? "/proto" : "/lang";
            const mutate = mode === "protolang" ? protolangMutate : langMutate;
            const Type = mode === "protolang" ? Protolanguage : Language;

            await invoke(create, { name });

            await mutate(async () => {
                const data = await invoke(get, { name });
                return Type.check(data);
            });

            setNewName("");
            setShowCreateDialog(false);
            setCreateError(null);
            showAppNotification({
                severity: "info",
                message: `Created ${noun} ${name}`,
                action: {
                    label: "Go",
                    act() {
                        navigate(`${prefix}/${name}/describe`)
                    }
                }
            });
        } catch (e) {
            setCreateError(getErrorMessage(e));
        }
    }

    async function delete_(name: string) {
        await invoke(
            mode === "protolang" ? "delete_protolanguage" : "delete_language",
            { name },
        );
    }

    if (error != undefined) {
        return (
            <>
                <NavBar title="Protolanguages" />
                <Typography variant="body1">
                    {getErrorMessage(error)}
                </Typography>
            </>
        );
    }

    if (langError != undefined && langId !== undefined) {
        return (
            <>
                <NavBar title="Protolanguages" />
                <Typography variant="body1">
                    {getErrorMessage(langError)}
                </Typography>
            </>
        );
    }

    const abs = (
        <>
            <Button
                color="primary"
                variant="contained"
                aria-label="add"
                onClick={() => setShowCreateDialog(true)}
            >
                <Add /> Create
            </Button>
        </>
    );

    const fabs = (
        <SpeedDial
            ariaLabel={`Back to ${mode === "protolang" ? "Protolanguage List" : "Language List"
                }`}
            sx={{ position: "absolute", bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
        >
            <SpeedDialAction
                key="back-to-list"
                icon={<Toc />}
                tooltipTitle={`${mode === "protolang" ? "Protolanguages" : "Languages"} List`}
                onClick={() => (mode === "protolang" ? navigate("/proto") : navigate("/lang"))}
            />
            <SpeedDialAction
                key="create"
                icon={<Create />}
                tooltipTitle={"Create New"}
                onClick={() => setShowCreateDialog(true)}
            />
        </SpeedDial>
    );

    const dialogs = (
        <>
            <Dialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
            >
                <DialogTitle>
                    New {mode === "protolang" ? "Protolanguage" : "Language"}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ py: 2 }}>
                        <TextField
                            sx={{ flexGrow: 1 }}
                            value={newName}
                            size="small"
                            label="Name"
                            required={true}
                            error={Boolean(createError)}
                            helperText={createError}
                            onChange={(ev) => setNewName(ev.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => create(newName)}>
                        <Add /> Create
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );

    return langId !== undefined ? (
        <Page title={mode === "protolang" ? "Protolanguages" : "Languages"}>
            {dialogs}
            {fabs}
            <Outlet context={{ mode }} />
        </Page>
    ) : (
        <Page title={mode === "protolang" ? "Protolanguages" : "Languages"}>
            <Toolbar>{abs}</Toolbar>
            <List dense>
                {names &&
                    names.map((name) => (
                        <ListItem
                            key={name}
                            secondaryAction={
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={async () => await delete_(name)}
                                >
                                    <Delete />
                                </IconButton>
                            }
                        >
                            <ListItemButton
                                role={undefined}
                                component={Link}
                                to={`${name}/describe`}
                            >
                                <ListItemText primary={name} />
                            </ListItemButton>
                        </ListItem>
                    ))}
            </List>

            {dialogs}
        </Page>
    );
}
