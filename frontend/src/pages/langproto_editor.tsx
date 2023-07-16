import { Link, Outlet, useOutletContext, useParams } from "react-router-dom";
import { useState } from "react";
import { Array, String } from "runtypes";
import useSWR, { KeyedMutator } from "swr";
import useSWRSubscription from "swr/subscription";
import { Protolanguage } from "~/src/data";
import { fetcher, subscribeGenerator } from "~/src/stores";
import { getErrorMessage } from "../util";
import * as classes from "./langproto_editor.module.css";
import { invoke } from "@tauri-apps/api";
import { NavBar } from "../components/navbar";
import { Alert, Box, Container, Snackbar, Typography } from "@mui/material";
import { ArrowUpward } from "@mui/icons-material";
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

export function BackToProtolanguageBanner() {
    return (<Box justifyContent="center" alignItems="center"
        flexDirection="row"
        sx={{
            display: "flex",
            color: "inherit",
            textDecoration: "none",
            backgroundColor: "lightGrey",
            "&:hover": { backgroundColor: "darkgrey" }
        }}
        component={Link}
        to={"/proto"}
    >
        <ArrowUpward />
        <Typography> Back to Protolanguage List</Typography>
    </Box>);
}

export default function ProtolangEditor() {
    const { plangId } = useParams();
    const { data: protoNames, error } = useSWRSubscription<string[]>(
        "all_protolanguages",
        subscribeGenerator(Array(String)),
    );
    const [newName, setNewName] = useState("");

    const { error: protolangError, mutate: protolangMutate } =
        useProtolanguage();

    const { showAppNotification } = useAppContext();

    async function createProtolanguage(name: string) {
        try {
            await invoke("create_protolanguage", { name });

            await protolangMutate(async () => {
                const protolangData = await invoke("get_protolanguage", { name });
                return Protolanguage.check(protolangData);
            });
        } catch (e) {
            showAppNotification({
                severity: "error",
                message: getErrorMessage(e),
            });
        }

        setNewName("");
    }

    async function deleteProtolanguage(name: string) {
        await invoke("delete_protolanguage", { name });
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

    if (protolangError != undefined && plangId != undefined) {
        return (
            <>
                <NavBar title="Protolanguages" />
                <Typography variant="body1">
                    {getErrorMessage(protolangError)}
                </Typography>
            </>
        );
    }

    return plangId !== undefined ? (
        <Outlet />
    ) : (
        <Page title="Protolanguages">
            <ul>
                {protoNames &&
                    protoNames.map((proto) => (
                        <li key={proto}>
                            {proto}
                            <ul className={classes.protolangEditorItemNav}>
                                <li>
                                    <Link to={`${proto}/phonemes`}>
                                        Phonemes
                                    </Link>
                                </li>
                                <li>
                                    <Link to={`${proto}/phonotactics`}>
                                        Phonotactics
                                    </Link>
                                </li>
                                <li>
                                    <Link to={`${proto}/lexicon`}>Lexicon</Link>
                                </li>
                                <li
                                    onClick={async () =>
                                        await deleteProtolanguage(proto)
                                    }
                                >
                                    <span className={classes.deleteLink}>
                                        DELETE
                                    </span>
                                </li>
                            </ul>
                        </li>
                    ))}
                <li>
                    <div>
                        <div>
                            <input
                                value={newName}
                                autoCorrect="off"
                                onChange={(ev) => setNewName(ev.target.value)}
                            />
                            {error && (
                                <p style={{ margin: 0, color: "red" }}>
                                    {error}
                                </p>
                            )}
                        </div>
                        <button onClick={() => createProtolanguage(newName)}>
                            Create Protolanguage
                        </button>
                    </div>
                </li>
            </ul>
        </Page>
    );
}