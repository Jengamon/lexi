import { useRouteError } from "react-router-dom";
import { getErrorMessage } from "../util";
import { theme } from "./app";
import { ThemeProvider } from "@emotion/react";
import { Page } from "../pages/page";
import { Box, Typography } from "@mui/material";

export default function KaboomAppView() {
    const error = useRouteError();

    return (
        <ThemeProvider theme={theme}>
            <Page title="KABOOM!">
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <Typography variant="h1">KABOOM!</Typography>
                    <Typography variant="body1">{getErrorMessage(error)}</Typography>
                </Box>
            </Page>
        </ThemeProvider>
    );
}
