import { RouteObject } from "react-router-dom";

import AboutPage from "~/src/pages/about";
import HomePage from "~/src/pages/home";
import Builder from "~/src/pages/lang/builder";
import PhonemesEditor from "~/src/pages/lang/phonemes_editor";
import AppView from "~/src/views/app";
import {
    LanguageEditor,
} from "~/src/pages/lang_editor";
import KaboomAppView from "./views/kaboom_app";
import Describer from "./pages/lang/describer";

// "Views" are top-level routes with *no* path.
// "Pages" make up the children of a view.

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
                element: <LanguageEditor mode="protolang" />,
                children: [
                    {
                        path: "phonemes",
                        element: <PhonemesEditor />,
                    },
                    {
                        path: "phonotactics",
                        // element: <BackToProtolanguageBanner />,
                    },
                    {
                        path: "lexicon",
                        // element: <BackToProtolanguageBanner />,
                    },
                    {
                        path: "builder",
                        element: <Builder />,
                    },
                    {
                        path: "describe",
                        element: <Describer />,
                    },
                ],
            },
            {
                path: "/lang/:langId?",
                element: <LanguageEditor mode="lang" />,
                children: [
                    {
                        path: "ancestry",
                        // element: <BackToLanguageBanner />,
                    },
                    {
                        path: "dialects",
                        // element: <BackToLanguageBanner />,
                    },
                    {
                        path: "phonemes",
                        element: <PhonemesEditor />,
                    },
                    {
                        path: "phonotactics",
                        // element: <BackToLanguageBanner />,
                    },
                    {
                        path: "lexicon",
                        // element: <BackToLanguageBanner />,
                    },
                    {
                        path: "builder",
                        element: <Builder />,
                    },
                    {
                        path: "describe",
                        element: <Describer />,
                    },
                ],
            },
        ],
    },
];
