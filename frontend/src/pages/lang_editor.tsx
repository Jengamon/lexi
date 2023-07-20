import {
    Add,
    Create,
    Delete,
    Toc,
    Language as LanguageIcon,
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
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    TextField,
    Toolbar,
    Typography,
    Link as MUILink,
    capitalize,
} from "@mui/material";
import { invoke } from "@tauri-apps/api";
import { useState } from "react";
import {
    Link,
    LoaderFunctionArgs,
    Outlet,
    useLoaderData,
    useNavigate,
    useOutletContext,
    useParams,
} from "react-router-dom";
import { Array, String } from "runtypes";
import { KeyedMutator } from "swr";
import { Language, Protolanguage } from "~/src/data";
import {
    useCheckedInvokeSWR,
    useCheckedInvoke,
} from "~/src/stores";
import { getErrorMessage } from "../util";
import { AppContext, useAppContext } from "../views/app";
import { Page } from "./page";

export function useProtolanguage() {
    const { plangId } = useParams();
    const { data, error, mutate } = useCheckedInvokeSWR(
        Protolanguage,
        "get_protolanguage",
        { name: plangId },
    );

    return {
        protolang: data,
        error,
        mutate,
    };
}

export function useLanguage() {
    const { langId } = useParams();
    const { data, error, mutate } = useCheckedInvokeSWR(
        Language,
        "get_language",
        { name: langId },
    );

    return {
        lang: data,
        error,
        mutate,
    };
}

export type LanguageEditorContext = {
    mode: "protolang" | "lang";
} & AppContext;

export function useLanguageEditorContext() {
    return useOutletContext<LanguageEditorContext>();
}

export type LanguageEditorProps = {
    mode: "lang" | "protolang";
};

export function LanguageEditorCrumb({
    data,
    mode,
}: { data: LanguageEditorLoaderData } & LanguageEditorProps) {
    const langData =
        data.currentProto !== undefined ? data.currentProto : data.currentLang;
    return (
        <MUILink
            underline="hover"
            color="inherit"
            component={Link}
            to={`/${mode === "protolang" ? "proto" : "lang"}/${langData !== undefined ? langData.name : ""
                }/describe`}
        >
            {langData !== undefined ? langData.name : "*UNKNOWN*"}{" "}
            {mode === "protolang" ? "Protolanguage" : "Language"}
        </MUILink>
    );
}

export async function LanguageEditorLoader({
    params,
}: LoaderFunctionArgs): Promise<LanguageEditorLoaderData> {
    const currentLang =
        params.langId !== undefined
            ? await useCheckedInvoke(Language, "get_language", {
                name: params.langId,
            })
            : undefined;
    const currentProto =
        params.plangId !== undefined
            ? await useCheckedInvoke(Protolanguage, "get_protolanguage", {
                name: params.plangId,
            })
            : undefined;

    const protoNames = await useCheckedInvoke(Array(String),
        "get_all_protolanguages", {});

    const langNames = await useCheckedInvoke(Array(String),
        "get_all_languages", {});

    return {
        currentLang,
        currentProto,
        protoNames,
        langNames,
    };
}

export type LanguageEditorLoaderData = {
    currentLang?: Language;
    currentProto?: Protolanguage;
    protoNames: string[];
    langNames: string[];
};

export function LanguageEditor({ mode }: LanguageEditorProps) {
    const { protoNames: loaderProtoNames, langNames: loaderLangNames } = useLoaderData() as LanguageEditorLoaderData;

    const { data: protoNames, error: protoError, mutate: protoNamesMutate } = useCheckedInvokeSWR(Array(String), "get_all_protolanguages", {
        fallbackData: loaderProtoNames
    });
    const { data: langNames, error: langError, mutate: langNamesMutate } = useCheckedInvokeSWR(Array(String), "get_all_languages", {
        fallbackData: loaderLangNames
    });

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
            protolangMutate={async (proto, opts) => {
                let ret = await protoMutate(proto, opts);
                await protoNamesMutate();
                return ret;
            }}
            langId={plangId}
            langError={protoDataError}
        />
    ) : (
        <LanguageEditorInner
            mode={mode}
            names={langNames}
            error={langError}
            langMutate={async (proto, opts) => {
                let ret = await langMutate(proto, opts);
                await langNamesMutate();
                return ret;
            }}
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

    const appContext = useAppContext();
    const navigate = useNavigate();
    const noun = mode === "protolang" ? "protolanguage" : "language";

    async function create(name: string) {
        try {
            const create =
                mode === "protolang"
                    ? "create_protolanguage"
                    : "create_language";
            const get =
                mode === "protolang" ? "get_protolanguage" : "get_language";
            const prefix = mode === "protolang" ? "/proto" : "/lang";

            await invoke(create, { name });

            if (mode === "protolang") {
                await protolangMutate(async () => {
                    const data = await invoke(get, { name });
                    return Protolanguage.check(data);
                });
            } else {
                await langMutate(async () => {
                    const data = await invoke(get, { name });
                    return Language.check(data);
                });
            }

            setNewName("");
            setShowCreateDialog(false);
            setCreateError(null);
            appContext.showAppNotification({
                severity: "info",
                message: `Created ${noun} ${name}`,
                action: {
                    label: "Go",
                    act() {
                        navigate(`${prefix}/${name}/describe`);
                    },
                },
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
            <Page>
                <Typography variant="body1">
                    ERROR: {getErrorMessage(error)}
                </Typography>
            </Page>
        );
    }

    if (langError != undefined && langId !== undefined) {
        return (
            <Page>
                <Typography variant="body1">
                    LANG ERROR: {getErrorMessage(langError)}
                </Typography>
            </Page>
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
            ariaLabel={`Back to ${capitalize(noun)} List`}
            sx={{ position: "fixed", bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
        >
            <SpeedDialAction
                key="back-to-list"
                icon={<Toc />}
                tooltipTitle={`${capitalize(noun)}s List`}
                onClick={() =>
                    mode === "protolang"
                        ? navigate("/proto")
                        : navigate("/lang")
                }
            />
            {langId !== undefined && (
                <SpeedDialAction
                    key="back-to-language-root"
                    icon={<LanguageIcon />}
                    tooltipTitle={`${capitalize(noun)} Root`}
                    onClick={() =>
                        mode === "protolang"
                            ? navigate(`/proto/${langId}/describe`)
                            : navigate(`/lang/${langId}/describe`)
                    }
                />
            )}
            <SpeedDialAction
                key="create"
                icon={<Create />}
                tooltipTitle={`Create New ${capitalize(noun)}`}
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
                <DialogTitle>New {capitalize(noun)}</DialogTitle>
                <DialogContent>
                    <Box sx={{ py: 2 }}>
                        <TextField
                            autoFocus
                            fullWidth
                            autoCorrect="off"
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
        <Page showBreadcrumbs>
            {dialogs}
            {fabs}
            <Outlet context={{ mode, ...appContext }} />
        </Page>
    ) : (
        <Page>
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
