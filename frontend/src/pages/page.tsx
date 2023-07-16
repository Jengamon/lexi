import { ReactNode } from "react";
import { NavBar } from "../components/navbar";
import { Box, Container } from "@mui/material";

export type PageProps = {
    title: string;
    children: ReactNode;
};

export function Page({ title, children }: PageProps) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
            }}
        >
            <NavBar title={title} />
            <Container
                maxWidth="lg"
                sx={{
                    mt: 3,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {children}
            </Container>
        </Box>
    );
}
