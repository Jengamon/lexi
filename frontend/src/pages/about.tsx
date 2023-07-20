import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import { String } from "runtypes";
import {
    displayPhone,
    fromSil,
    fromBranner,
    getErrorMessage,
} from "~/src/util";
import { Phone } from "~/src/data";
import { useCheckedInvokeSWR } from "../stores";
import { useAutosave } from "../views/app";
import {
    Box,
    Button,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Page } from "./page";

export default function AboutPage() {
    const [testExport, setTestExport] = useState<
        string | { error: string } | null
    >(null);
    const [brannerInput, setBrannerInput] = useState("");
    const [branner, setBranner] = useState("");
    const [silInput, setSilInput] = useState("");
    const [sil, setSil] = useState("");
    const { autosave, error: autosaveError } = useAutosave();

    const { data: dumpedLangGroup, error: dumpedLangGroupError } =
        useCheckedInvokeSWR(String, "dump_language_group", {});

    const [testDisplayPhone, setDisplayPhone] = useState("");

    useEffect(() => {
        const phone: Phone = {
            Affricative: {
                start_place: "Bilabial",
                end_place: "Labiodental",
                voiced: false,
                attachments: ["Preaspirated"],
            },
        };

        displayPhone(phone).then((output) => setDisplayPhone(output));
    });

    async function testExportCurrentProject() {
        try {
            const data = await invoke("test_export_language_group", {});
            setTestExport(String.check(data));
        } catch (e) {
            setTestExport({ error: getErrorMessage(e) });
        }
    }

    return (
        <Page>
            <Typography variant="body1" fontFamily="sans-serif">
                {testDisplayPhone}
            </Typography>
            <Typography variant="body1" component="em">
                Lexi is about making coming up with conlangs easier by providing
                a programmatic way to store and explore conlangs both
                synchronically and diachronically.
            </Typography>
            {autosave ? (
                <Typography align="center" variant="body1">
                    Last autosaved: {autosave.name} at{" "}
                    {new Date(autosave.timestamp).toLocaleDateString()}{" "}
                    {new Date(autosave.timestamp).toLocaleTimeString()}
                </Typography>
            ) : (
                <Typography align="center" variant="body1">
                    Have not autosaved this session
                </Typography>
            )}
            {autosaveError && (
                <Typography variant="body1">
                    Encountered autosave error: {getErrorMessage(autosaveError)}
                </Typography>
            )}
            <Box>
                <Button onClick={testExportCurrentProject}>Test Export</Button>
                {testExport && (
                    <Paper component="pre">
                        {String.guard(testExport) ? (
                            <Typography fontFamily="monospace">
                                {testExport}
                            </Typography>
                        ) : (
                            <Typography fontFamily="monospace" color="error">
                                {testExport.error}
                            </Typography>
                        )}
                    </Paper>
                )}
            </Box>
            <Stack spacing={2}>
                <Box>
                    <TextField
                        label="Branner"
                        inputProps={{
                            autoCorrect: "off",
                        }}
                        autoComplete="off"
                        value={brannerInput}
                        onChange={async (ev) => {
                            const input = ev.target.value.replace(
                                /[\u201C\u201D]/g,
                                '"',
                            );
                            setBrannerInput(input);
                            const newBranner = await fromBranner(input);
                            setBranner(newBranner);
                        }}
                    />
                    <Typography variant="ipa">
                        {branner}
                    </Typography>
                </Box>
                <Box>
                    <TextField
                        label="SIL"
                        inputProps={{
                            autoCorrect: "off",
                        }}
                        autoComplete="off"
                        value={silInput}
                        onChange={async (ev) => {
                            const input = ev.target.value.replace(
                                /[\u201C\u201D]/g,
                                '"',
                            );
                            setSilInput(input);
                            const newSil = await fromSil(input);
                            setSil(newSil);
                        }}
                    />
                    <Typography variant="ipa">
                        {sil}
                    </Typography>
                </Box>
            </Stack>
            <Box>
                <Paper component="pre">
                    {dumpedLangGroup ? (
                        <Typography fontFamily="monospace">
                            {dumpedLangGroup}
                        </Typography>
                    ) : (
                        <Typography fontFamily="monospace" color="error">
                            {getErrorMessage(dumpedLangGroupError)}
                        </Typography>
                    )}
                </Paper>
            </Box>
        </Page>
    );
}
