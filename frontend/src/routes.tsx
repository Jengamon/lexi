import { RouteObject } from "react-router-dom";

import HomePage from "~/src/pages/home";
import AboutPage from "~/src/pages/about";
import AppView from "~/src/views/app";
import ProtolangEditor from "~/src/views/langproto_editor";
import NotFound from "~/src/pages/not_found";
import LangEditor from "~/src/views/lang_editor";
import PhonemesEditor from "~/src/pages/lang/phonemes_editor";

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
                element: <AboutPage />,
            },
            {
                path: "/proto/:langId?",
                element: <ProtolangEditor />,
                children: [
                    {
                        path: "phonemes",
                        element: <PhonemesEditor />,
                    },
                    {
                        path: "phonotactics",
                    },
                    {
                        path: "lexicon",
                    },
                    {
                        path: "builder",
                    },
                ],
            },
            {
                path: "/lang/:langId?",
                element: <LangEditor />,
                children: [
                    {
                        path: "ancestry",
                    },
                    {
                        path: "dialects",
                    },
                    {
                        path: "phonemes",
                        element: <PhonemesEditor />,
                    },
                    {
                        path: "phonotactics",
                    },
                    {
                        path: "lexicon",
                    },
                    {
                        path: "builder",
                    },
                ],
            },
            {
                path: "*",
                element: <NotFound />,
            },
        ],
    },
];
