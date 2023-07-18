import {
    Alert,
    Link as MUILink,
    Box,
    Button,
    CssBaseline,
    Snackbar,
    ThemeOptions,
    ThemeProvider,
    createTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
    Link,
    Outlet,
    ScrollRestoration,
    useOutletContext,
} from "react-router-dom";
import { Record, Static, String } from "runtypes";
import useSWRSubscription from "swr/subscription";
import { subscribeGenerator, useCheckedInvokeSWR } from "../stores";
import { useImmer } from "use-immer";

declare module "@mui/material/styles" {
    interface TypographyVariants {
        // ipa: React.CSSProperties;
    }

    // allow configuration using `createTheme`
    interface TypographyVariantsOptions {
        // ipa?: React.CSSProperties;
    }
}

declare module "@mui/material/Typography" {
    interface TypographyPropsVariantOverrides {
        // ipa: true;
    }
}

export const theme = {
    palette: {
        mode: "light" as "light" | "dark",
        primary: {
            main: "#aeafbd",
        },
        secondary: {
            main: "#f50057",
        },
    },
    typography: {},
    components: {
        MuiTypography: {
            defaultProps: {
                variantMapping: {},
            },
        },
    },
} as const;

type AppNotif = {
    severity: "info" | "warning" | "error";
    message: string;
    action?: {
        label: string;
        act: () => void;
    };
};

export type AppContext = {
    showAppNotification: (notif: AppNotif) => void;
    darkMode: boolean;
    setDarkMode: (darkMode: boolean) => void;
};

export function useAppContext() {
    return useOutletContext<AppContext>();
}

export function useAutosave() {
    const Autosave = Record({
        name: String,
        timestamp: String,
    });

    const { data, error } = useSWRSubscription<Static<typeof Autosave>>(
        "autosaved",
        subscribeGenerator(Autosave),
    );

    return {
        autosave: data,
        error,
    };
}

export function AppViewCrumb() {
    const { data: projectName } = useCheckedInvokeSWR(
        String,
        "get_project_name",
        {},
    );

    return (
        <MUILink underline="hover" color="inherit" component={Link} to="/">
            {projectName}
        </MUILink>
    );
}

export default function AppView() {
    const [notif, setNotif] = useState<AppNotif | null>(null);
    const [hasNotif, setHasNotif] = useState<boolean>(false);
    const [darkMode, setDarkMode_] = useState(false);
    const [modTheme, updateTheme] = useImmer(theme);

    const setDarkMode = (darkMode: boolean) => {
        setDarkMode_(darkMode);
        localStorage.setItem("darkMode", darkMode ? "dark" : "light");
        updateTheme((theme) => {
            theme.palette.mode = darkMode ? "dark" : "light";
        });
    };

    useEffect(() => {
        const existingPreference = localStorage.getItem("darkMode");
        if (existingPreference) {
            existingPreference === "light"
                ? setDarkMode(false)
                : setDarkMode(true);
        } else {
            setDarkMode(false);
            localStorage.setItem("darkMode", "light");
        }
    }, []);

    return (
        <ThemeProvider theme={createTheme(modTheme)}>
            <CssBaseline enableColorScheme />
            <Outlet
                context={{
                    showAppNotification: (notif: AppNotif) => {
                        setNotif(notif);
                        setHasNotif(true);
                    },
                    darkMode,
                    setDarkMode,
                }}
            />
            <Snackbar
                key={notif?.message}
                open={hasNotif}
                autoHideDuration={6000}
                onClose={() => setHasNotif(false)}
            >
                <Alert
                    onClose={() => setHasNotif(false)}
                    severity={notif?.severity}
                    action={
                        notif?.action !== undefined ? (
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    notif?.action?.act();
                                    setHasNotif(false);
                                }}
                            >
                                {notif?.action.label}
                            </Button>
                        ) : undefined
                    }
                >
                    {notif?.message}
                </Alert>
            </Snackbar>
            <ScrollRestoration />
        </ThemeProvider>
    );
}
