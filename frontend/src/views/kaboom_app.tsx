import { NavBar } from "~/src/components/navbar";

import * as classes from "./kaboom_app.module.css";
import { useRouteError } from "react-router-dom";
import { getErrorMessage } from "../util";

export default function KaboomAppView() {
    const error = useRouteError();

    return (
        <div className={classes.app}>
            <NavBar />

            <div>
                <h1>KABOOM!</h1>
                <p>{getErrorMessage(error)}</p>
            </div>
        </div>
    );
}
