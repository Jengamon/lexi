import * as classes from "./builder.module.css";

import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $getRoot, $getSelection, EditorState, LexicalEditor } from "lexical";
import {
    InitialConfigType,
    LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";
import { NavBar } from "~/src/components/navbar";
import { BackToLanguageBanner, useLanguage } from "~/src/pages/lang_editor";
import { capitalize } from "lodash-es";
import { Typography } from "@mui/material";

const theme = {};

function onChange(editorState: EditorState) {
    editorState.read(() => {
        // Read contents of EditorState here.
        const root = $getRoot();
        const selection = $getSelection();

        console.log(root, selection);
    });
}

function onError(error: any) {
    console.error(error);
}

export default function Builder() {
    const initialConfig: InitialConfigType = {
        namespace: "BuilderEditor",
        theme,
        onError,
    };
    const editorStateRef = useRef<EditorState>();
    const { lang } = useLanguage();

    return lang !== undefined ? (
        <>
            <NavBar title={`${capitalize(lang.name)}'s Builder`} />
            <BackToLanguageBanner />
            <LexicalComposer initialConfig={initialConfig}>
                <PlainTextPlugin
                    contentEditable={
                        <ContentEditable className={classes.contentEditable} />
                    }
                    placeholder={<div>Enter some text...</div>}
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <OnChangePlugin onChange={onChange} />
                <OnChangePlugin
                    onChange={(editorState) =>
                        (editorStateRef.current = editorState)
                    }
                />
                <HistoryPlugin />
            </LexicalComposer>
        </>
    ) : (
        <>
            <NavBar title="Builder" />
            <BackToLanguageBanner />
            <Typography variant="body1">
                Cannot edit without an active (proto-)language
            </Typography>
        </>
    );
}
