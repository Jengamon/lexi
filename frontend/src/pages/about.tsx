import {useState} from "react";
import {useProjectStore} from "~/src/stores";
import * as classes from "./about.module.css";

export default function AboutPage() {
    const [showDebug, setShowDebug] = useState(false);
    const project = useProjectStore(proj => proj.group);

    return (
        <div>
            <h1>About</h1>
            <p>Lexi is about making coming up with conlangs easier by providing a programmatic way to
            store and explore conlangs both synchronically and diachronically.</p>
            <button onClick={() => setShowDebug(!showDebug)}>Show Debug</button>
            {showDebug && <pre className={classes.debug}>
                <code>
                    {JSON.stringify(project, null, 2)}
                </code>
            </pre>}
        </div>
    );
}
