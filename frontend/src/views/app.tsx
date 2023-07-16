import { Alert, Snackbar } from "@mui/material";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { Record, String } from "runtypes";

type AppNotif = {
    severity: "info" | "error",
    message: string,
};

export type AppContext = {
    setAppNotification: (notif: AppNotif) => void,
}

export function useAppContext() {
    return useOutletContext<AppContext>();
}

export default function AppView() {
    const [notif, setNotif] = useState<AppNotif | null>(null);
    const [hasNotif, setHasNotif] = useState<boolean>(false);

    useEffect(() => {
        async function fetch() {
            return await listen("autosaved", ev => {
                console.log(ev);

                const payload = ev.payload;
                const Autosave = Record({
                    name: String,
                    timestamp: String,
                });
                const validated = Autosave.check(payload);

                setNotif({
                    severity: "info",
                    message: `Saved ${validated.name} at ${validated.timestamp}`,
                });
                setHasNotif(true);
            });
        }

        const unlisten = fetch();

        return () => {
            unlisten.then(unsub => unsub())
        };
    }, [])

    return (
        <div>
            <Outlet context={{
                setAppNotification: (notif: AppNotif) => {
                    setNotif(notif);
                    setHasNotif(true);
                }
            }} />
            <Snackbar
                open={hasNotif}
                autoHideDuration={6000}
                onClose={() => setHasNotif(false)}>
                <Alert onClose={() => setHasNotif(false)} severity={notif?.severity}>
                    {notif?.message}
                </Alert>
            </Snackbar>
        </div>
    );
}
