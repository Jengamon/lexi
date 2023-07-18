import { useMatches } from "react-router-dom";
import { Function, Record, Unknown } from "runtypes";
import { Box, Breadcrumbs as MUIBreadcrumbs } from "@mui/material";
import { NavigateNext } from "@mui/icons-material";

const Breadcrumbable = Record({
    handle: Record({
        crumb: Function,
    }),
    data: Unknown
});

// TODO Use App loader functions...

export function Breadcrumbs() {
    let matches = useMatches();
    let crumbs = matches
        // first get rid of any matches that don't have handle and crumb
        .filter((match) => Breadcrumbable.guard(match))
        .map((match) => Breadcrumbable.check(match))
        // now map them into an array of elements, passing the loader
        // data to each one
        .map((match, index) => match.handle.crumb(index, match.data));

    return (
        <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
            <MUIBreadcrumbs aria-label="breadcrumbs"
                separator={<NavigateNext fontSize="small" />}>
                {crumbs}
            </MUIBreadcrumbs>
        </Box>
    );
}
