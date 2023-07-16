import { RouteObject, useRouteError } from "react-router-dom";

import AboutPage from "~/src/pages/about";
import HomePage from "~/src/pages/home";
import Builder from "~/src/pages/lang/builder";
import PhonemesEditor from "~/src/pages/lang/phonemes_editor";
import NotFound from "~/src/pages/not_found";
import AppView from "~/src/views/app";
import LangEditor, { BackToLanguageBanner } from "~/src/views/lang_editor";
import ProtolangEditor, { BackToProtolanguageBanner } from "~/src/views/langproto_editor";
import KaboomAppView from "./views/kaboom_app";

export const ROUTES: readonly RouteObject[] = [
    {
        element: <AppView />,
        errorElement: <KaboomAppView />,
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
                path: "/proto/:plangId?",
                element: <ProtolangEditor />,
                children: [
                    {
                        path: "phonemes",
                        element: <PhonemesEditor />,
                    },
                    {
                        path: "phonotactics",
                        element: <BackToProtolanguageBanner />,
                    },
                    {
                        path: "lexicon",
                        element: <BackToProtolanguageBanner />,
                    },
                    {
                        path: "builder",
                        element: <Builder />,
                    },
                ],
            },
            {
                path: "/lang/:langId?",
                element: <LangEditor />,
                children: [
                    {
                        path: "ancestry",
                        element: <BackToLanguageBanner />,
                    },
                    {
                        path: "dialects",
                        element: <BackToLanguageBanner />,
                    },
                    {
                        path: "phonemes",
                        element: <PhonemesEditor />,
                    },
                    {
                        path: "phonotactics",
                        element: <BackToLanguageBanner />,
                    },
                    {
                        path: "lexicon",
                        element: <BackToLanguageBanner />,
                    },
                    {
                        path: "builder",
                        element: <Builder />,
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
