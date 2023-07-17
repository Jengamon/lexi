import { useRouteError } from "react-router-dom";
import { getErrorMessage } from "../util";
import { theme } from "./app";
import { ThemeProvider } from "@emotion/react";
import { Box, CssBaseline, Typography, createTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useImmer } from "use-immer";

export default function KaboomAppView() {
    const error = useRouteError();
    const [_, setDarkMode_] = useState(false);
    const [modTheme, updateTheme] = useImmer(theme);

    const setDarkMode = (darkMode: boolean) => {
        setDarkMode_(darkMode);
        updateTheme(theme => {
            theme.palette.mode = darkMode ? "dark" : "light";
        });
    };

    useEffect(() => {
        const existingPreference = localStorage.getItem("darkMode");
        if (existingPreference) {
            (existingPreference === "light")
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
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Typography variant="h1">KABOOM!</Typography>
                <Typography variant="body1">
                    {getErrorMessage(error)}
                </Typography>
            </Box>
        </ThemeProvider>
    );
}
