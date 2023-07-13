import { RouteObject } from "react-router-dom";

import RootPage from "./pages/root_page";

export const ROUTES: readonly RouteObject[] = [
    {
        path: "/",
        element: <RootPage />,
    },
];
