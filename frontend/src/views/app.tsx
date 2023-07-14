import { NavBar } from "~/src/components/navbar";
import { Outlet } from "react-router-dom";

import * as classes from "./app.module.css";

export default function AppView() {
    return (
        <div className={classes.app}>
            <NavBar />
            <Outlet />
        </div>
    );
}
