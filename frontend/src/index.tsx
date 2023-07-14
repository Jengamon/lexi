import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import {
    createBrowserRouter,
    RouteObject,
    RouterProvider,
} from "react-router-dom";
import { ROUTES } from "./routes";
import { NavBar } from "~/src/components/navbar";

const node = document.getElementById("app");

if (node != null) {
    const root = createRoot(node);

    const router = createBrowserRouter(ROUTES as RouteObject[], {});

    root.render(
        <StrictMode>
            <RouterProvider router={router} />
        </StrictMode>,
    );
} else {
    console.error("Failed to find app root.");
}
