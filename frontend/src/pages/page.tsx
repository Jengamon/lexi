import { ReactNode } from "react";
import { NavBar } from "../components/navbar";
import { Breadcrumbs } from "../components/breadcrumbs";
import { Container } from "@mui/material";

export type PageProps = {
    children: ReactNode;
    showBreadcrumbs?: boolean;
};

export function Page({ showBreadcrumbs, children }: PageProps) {
    return (
        <>
            <NavBar />
            {showBreadcrumbs && <Breadcrumbs />}
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
