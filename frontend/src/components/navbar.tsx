import * as classes from "./navbar.module.css";
import { Link, NavLink } from "react-router-dom";
import * as classNames from "classnames";

export interface NavbarProps {}

export function NavBar(props: NavbarProps) {
    const tabs = [
        {
            label: "Home",
            href: "/",
        },
        {
            label: "About",
            href: "/about",
        },
    ];
    return (
        <nav className={classes.navbar}>
            {tabs.map((tab) => (
                <NavLink
                    to={tab.href}
                    key={tab.label}
                    className={({ isActive }) =>
                        classNames({
                            [classes.link]: true,
                            [classes.active]: isActive,
                        })
                    }
                >
                    {tab.label}
                </NavLink>
            ))}
        </nav>
    );
}
