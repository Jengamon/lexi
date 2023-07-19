import {
    AppBar,
    Box,
    Button,
    Container,
    FormControlLabel,
    FormGroup,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Switch,
    Toolbar,
    Typography,
    useScrollTrigger,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import { NavLink } from "react-router-dom";
import { useState, MouseEvent } from "react";
import { useAppContext } from "../views/app";

export interface NavbarProps {}

export function NavBar({}: NavbarProps) {
    const tabs = [
        {
            label: "Protolanguages",
            href: "/proto",
        },
        {
            label: "Languages",
            href: "/lang",
        },
        {
            label: "Settings",
            href: "/settings",
        },
        {
            label: "About",
            href: "/about",
        },
    ];
    const menu = [
        {
            label: "Home",
            href: "/",
        },
        ...tabs,
    ];

    const { darkMode, setDarkMode } = useAppContext();
    const [anchorNav, setAnchorNav] = useState<null | HTMLElement>(null);
    const trigger = useScrollTrigger();

    function handleOpenNavMenu(ev: MouseEvent<HTMLElement>) {
        setAnchorNav(ev.currentTarget);
    }

    function handleCloseNavMenu() {
        setAnchorNav(null);
    }

    return (
        <>
            <AppBar elevation={trigger ? 4 : 1}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {/* Icon goes here */}
                        <Typography
                            variant="h4"
                            component={NavLink}
                            to="/"
                            sx={{
                                mr: 2,
                                display: { xs: "none", md: "flex" },

                                fontWeight: 700,
                                color: "inherit",
                                textDecoration: "none",
                            }}
                        >
                            LEXI
                        </Typography>
                        <Box
                            sx={{
                                flexGrow: 1,
                                display: { xs: "flex", md: "none" },
                            }}
                        >
                            <IconButton
                                size="large"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorNav}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "left",
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "left",
                                }}
                                open={Boolean(anchorNav)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: "block", md: "none" },
                                }}
                            >
                                {menu.map((tab) => (
                                    <MenuItem
                                        key={tab.label}
                                        onClick={handleCloseNavMenu}
                                        component={NavLink}
                                        to={tab.href}
                                        sx={{
                                            "&.active": {
                                                bgcolor: "secondary.main",
                                                color: "white",
                                            },
                                        }}
                                    >
                                        <Typography textAlign="center">
                                            {tab.label}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                        <Typography
                            variant="h4"
                            noWrap
                            component={NavLink}
                            to=""
                            sx={{
                                mr: 2,
                                display: { xs: "flex", md: "none" },
                                flexGrow: 1,
                                fontWeight: 700,
                                color: "inherit",
                                textDecoration: "none",
                            }}
                        >
                            LEXI
                        </Typography>
                        <Box
                            sx={{
                                flexGrow: 1,
                                display: { xs: "none", md: "flex" },
                            }}
                        >
                            <Stack direction="row" spacing={2}>
                                {tabs.map((tab) => (
                                    <Button
                                        key={tab.label}
                                        component={NavLink}
                                        to={tab.href}
                                        sx={{
                                            color: "inherit",
                                            display: "block",
                                            "&.active": {
                                                backgroundColor: "white",
                                                color: "secondary.main",
                                            },
                                        }}
                                    >
                                        {tab.label}
                                    </Button>
                                ))}
                            </Stack>
                        </Box>
                        <Box sx={{ flexGrow: 0 }}>
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={darkMode}
                                            onChange={() =>
                                                setDarkMode(!darkMode)
                                            }
                                        />
                                    }
                                    label={darkMode ? "Dark" : "Light"}
                                />
                            </FormGroup>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            <Toolbar />
        </>
        // <nav className={classes.navbar}>
        //     {tabs.map((tab) => (
        //         <NavLink
        //             to={tab.href}
        //             key={tab.label}
        //             className={({ isActive }) =>
        //                 classNames({
        //                     [classes.link]: true,
        //                     [classes.active]: isActive,
        //                 })
        //             }
        //         >
        //             {tab.label}
        //         </NavLink>
        //     ))}
        // </nav>
    );
}
