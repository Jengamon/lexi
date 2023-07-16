import { Alert, Container, Snackbar, ThemeProvider, createTheme } from "@mui/material";
import { useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { Record, Static, String } from "runtypes";
import useSWRSubscription from "swr/subscription";
import { subscribeGenerator } from "../stores";

declare module '@mui/material/styles' {
    interface TypographyVariants {
        ipa: React.CSSProperties;
    }

    // allow configuration using `createTheme`
    interface TypographyVariantsOptions {
        ipa?: React.CSSProperties;
    }
}

declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        ipa: true;
    }
}

export const theme = createTheme({
    typography: {
        /// Use for any text meant to contain IPA
        ipa: {
            fontFamily: "sans-serif"
        }
    },
    components: {
        MuiTypography: {
            defaultProps: {
                variantMapping: {
                    ipa: 'p'
                }
            }
        }
    }
})

type AppNotif = {
    severity: "info" | "warning" | "error",
    message: string,
};

export type AppContext = {
    showAppNotification: (notif: AppNotif) => void,
}

export function useAppContext() {
    return useOutletContext<AppContext>();
}

export function useAutosave() {
    const Autosave = Record({
        name: String,
        timestamp: String,
    });

    const { data, error } = useSWRSubscription<Static<typeof Autosave>>("autosaved", subscribeGenerator(Autosave));

    return {
        autosave: data,
        error
    };
}

export default function AppView() {
    const [notif, setNotif] = useState<AppNotif | null>(null);
    const [hasNotif, setHasNotif] = useState<boolean>(false);

    return (
        <ThemeProvider theme={theme}>
            <Outlet context={{
                showAppNotification: (notif: AppNotif) => {
                    setNotif(notif);
                    setHasNotif(true);
                }
            }} />
            <Snackbar
                key={notif?.message}
                open={hasNotif}
                autoHideDuration={6000}
                onClose={() => setHasNotif(false)}>
                <Alert onClose={() => setHasNotif(false)} severity={notif?.severity}>
                    {notif?.message}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
}
