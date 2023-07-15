import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import {
    createBrowserRouter,
    RouteObject,
    RouterProvider,
} from "react-router-dom";
import { ROUTES } from "./routes";
import { invoke } from "@tauri-apps/api";

// Start services
(async () => {
    await invoke("init_languages_server", {});
})();

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
