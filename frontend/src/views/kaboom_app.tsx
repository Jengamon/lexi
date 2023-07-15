import { useRouteError } from "react-router-dom";
import { getErrorMessage } from "../util";

export default function KaboomAppView() {
    const error = useRouteError();

    return (
        <div>
            <div>
                <h1>KABOOM!</h1>
                <p>{getErrorMessage(error)}</p>
            </div>
        </div>
    );
}
