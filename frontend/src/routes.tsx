import { RouteObject } from "react-router-dom";

import HomePage from "~/src/pages/home";
import AboutPage from "~/src/pages/about";
import AppView from "~/src/views/app";

export const ROUTES: readonly RouteObject[] = [
    {
        element: <AppView />,
        children: [
            {
                path: "/",
                element: <HomePage />,
            },
            {
                path: "/about",
                element: <AboutPage />
            },
        ]
    }
];
