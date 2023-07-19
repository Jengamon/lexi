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
    await invoke("init_protolanguages_server", {});
    // Just interact with localstorage to change
    // When changed, remember to reinvoke the service with
    // the new value
    let autosaveInterval = localStorage.getItem("autosave");
    if (autosaveInterval && parseInt(autosaveInterval) > 0) {
        await invoke("init_autosave_service", {
            halfMinutes: parseInt(autosaveInterval),
        });
    } else {
        const defaultHM = 4;
        localStorage.setItem("autosave", defaultHM.toFixed(0));
        await invoke("init_autosave_service", { halfMinutes: defaultHM });
    }
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
