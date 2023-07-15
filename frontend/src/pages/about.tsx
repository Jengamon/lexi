import { useCallback, useEffect, useState } from "react";
import * as classes from "./about.module.css";
import { invoke } from "@tauri-apps/api";
import { String } from "runtypes";
import { displayPhone, displayPhoneBranner, fromBranner, getErrorMessage } from "~/src/util";
import { Phone } from "~/src/data";
import useSWR from "swr";
import { fetcher } from "../stores";

export default function AboutPage() {
    const [testExport, setTestExport] = useState<
        string | { error: string } | null
    >(null);
    const [brannerInput, setBrannerInput] = useState("");
    const [branner, setBranner] = useState("");

    const {
        data: dumpedLangGroup,
        error: dumpedLangGroupError,
    } = useSWR<string>(["dump_language_group", String, {}], fetcher);

    const updateBranner = useCallback(
        async () => await fromBranner(brannerInput),
        [brannerInput],
    );
    updateBranner().then((output) => setBranner(output));

    const [testDisplayPhone, setDisplayPhone] = useState({
        ipa: "",
        branner: "",
    });

    useEffect(() => {
        const phone: Phone = {
            Affricative: {
                start_place: "Dental",
                end_place: "Alveolar",
                voiced: true,
                attachments: ["Preaspirated", "Creaky", "Breathy", "Ejective"],
            },
        };

        displayPhone(phone).then(async ipa => ({
            ipa,
            branner: await displayPhoneBranner(phone)
        })).then((output) => setDisplayPhone(output));
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
        <div>
            <h1>About</h1>
            <p>{testDisplayPhone.ipa} {testDisplayPhone.branner}</p>
            <p>
                Lexi is about making coming up with conlangs easier by providing
                a programmatic way to store and explore conlangs both
                synchronically and diachronically.
            </p>
            <div>
                <button onClick={testExportCurrentProject}>Test Export</button>
                {testExport && (
                    <pre className={classes.debug}>
                        {String.guard(testExport) ? (
                            <code>{testExport}</code>
                        ) : (
                            <code className={classes.error}>
                                {testExport.error}
                            </code>
                        )}
                    </pre>
                )}
            </div>
            <div>
                <input
                    autoCorrect="off"
                    value={brannerInput}
                    onChange={(ev) =>
                        setBrannerInput(
                            // the `replace` is to remove "smart quotes"
                            // the second is to add nbsp support
                            ev.target.value.replace(/[\u201C\u201D]/g, '"'),
                        )
                    }
                />
                <p>{branner}</p>
            </div>
            <div>
                <pre className={classes.debug}>
                    {dumpedLangGroup ?
                        <code>{dumpedLangGroup}</code> :
                        <code className={classes.error}>{getErrorMessage(dumpedLangGroupError)}</code>}
                </pre>
            </div>
        </div>
    );
}
