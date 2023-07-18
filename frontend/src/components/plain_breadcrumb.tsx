import { Typography } from "@mui/material";

type PlainBreadcrumbProps = {
    text: string;
};

export function PlainBreadcrumb({ text }: PlainBreadcrumbProps) {
    return <Typography color="inherit">{text}</Typography>;
}
