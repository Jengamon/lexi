import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import {
    createBrowserRouter,
    RouteObject,
    RouterProvider,
} from "react-router-dom";
import { ROUTES } from "./routes";
import { invoke } from "@tauri-apps/api";
import { getErrorMessage } from "./util";

class AutosaveService {
    _service: NodeJS.Timeout;
    constructor() {
        this._service = setTimeout(
            this.autosaveService.bind(this),
            this.getAutosaveHalfMiutes() * 30_000,
        );
    }

    getAutosaveHalfMiutes(): number {
        let autosaveInterval = localStorage.getItem("autosave");
        if (autosaveInterval && parseInt(autosaveInterval) > 0) {
            return parseInt(autosaveInterval);
        } else {
            return 4;
        }
    }

    autosaveService() {
        invoke("request_autosave", {}).catch((e) =>
            console.error(`Failed to autosave: ${getErrorMessage(e)}`),
        );
        this._service = setTimeout(
            this.autosaveService.bind(this),
            this.getAutosaveHalfMiutes() * 30_000,
        );
    }

    resetService() {
        clearTimeout(this._service);
        this._service = setTimeout(
            this.autosaveService.bind(this),
            this.getAutosaveHalfMiutes() * 30_000,
        );
    }
}

export const autosaveService = new AutosaveService();

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
