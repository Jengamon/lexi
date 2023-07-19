import { useEffect, useState } from "react";
import { Page } from "./page";
import { FormControlLabel, FormLabel, Slider } from "@mui/material";
import { invoke } from "@tauri-apps/api";

// Stolen from https://www.30secondsofcode.org/js/s/format-duration/
const formatDuration = (ms: number) => {
    if (ms < 0) ms = -ms;
    const time = {
        day: Math.floor(ms / 86400000),
        hour: Math.floor(ms / 3600000) % 24,
        minute: Math.floor(ms / 60000) % 60,
        second: Math.floor(ms / 1000) % 60,
        millisecond: Math.floor(ms) % 1000,
    };
    return Object.entries(time)
        .filter((val) => val[1] !== 0)
        .map(([key, val]) => `${val} ${key}${val !== 1 ? "s" : ""}`)
        .join(", ");
};

export default function SettingsPage() {
    const [autosave, setAutosave] = useState(4);

    useEffect(() => {
        const existingPreference = localStorage.getItem("autosave");
        if (existingPreference && parseInt(existingPreference) > 0) {
            setAutosave(parseInt(existingPreference));
        } else {
            localStorage.setItem("autosave", autosave.toString());
        }
    }, []);

    return (
        <Page>
            <FormLabel>
                Autosave Interval: {formatDuration(autosave * 30_000)}
            </FormLabel>
            <Slider
                min={1}
                value={autosave}
                max={20}
                onChange={(_ev, val) =>
                    setAutosave(Array.isArray(val) ? val[0] : val)
                }
                onChangeCommitted={async () => {
                    await invoke("init_autosave_service", {
                        halfMinutes: autosave,
                    });
                    localStorage.setItem("autosave", autosave.toString());
                }}
            />
        </Page>
    );
}
