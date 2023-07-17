import { ReactNode } from "react";
import { NavBar } from "../components/navbar";
import { Box, Container, Paper, Toolbar } from "@mui/material";

export type PageProps = {
    title: string;
    children: ReactNode;
};

export function Page({ title, children }: PageProps) {
    return (
        <>
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
        </>
    );
}
