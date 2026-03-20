import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarPortal,
    MenubarTrigger,
} from "./menubar";
import React from "react";
import { AvailableTheme, Theme, useTheme } from "./theme-provider";
import { CircleUserRound } from "lucide-react";
import { useUser } from "@/hooks/UserProvider";
import { useNavigate } from "react-router-dom";

const NavigationList = [
    { title: "Home", value: "/dashboard" },
    {
        title: "Bouquet",
        value: "/bouquet",
        submenu: [
            {
                title: "Bouquets",
                value: "/dashboard/bouquet",
            },
            {
                title: "Categories",
                value: "/dashboard/categories",
            },
        ],
    },
    {
        title: "Customers",
        value: "/dashboard/customers",
    },
];

export default function Navbar({
    children,
}: {
    children?: React.ReactNode | React.ReactNode[];
}) {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const { user, logout } = useUser();

    return (
        <React.Fragment>
            <nav className="p-2 flex items-center w-full">
                <Menubar className="w-full items-center justify-end">
                    <div className="flex gap-2 items-center justify-center">
                        {user === "admin" &&
                            NavigationList.map((item, index) => {
                                return (
                                    <MenubarMenu key={index}>
                                        <MenubarTrigger
                                            onClick={(e) => {
                                                if (!item.submenu) {
                                                    navigate(item.value);
                                                }
                                            }}
                                        >
                                            {item.title}
                                        </MenubarTrigger>{" "}
                                        {item.submenu && (
                                            <MenubarPortal>
                                                <MenubarContent>
                                                    {item.submenu.map(
                                                        (submenu, index) => (
                                                            <MenubarItem
                                                                asChild
                                                                key={index}
                                                                textValue={
                                                                    submenu.value
                                                                }
                                                            >
                                                                <a
                                                                    className="w-full hover:cursor-pointer"
                                                                    href={
                                                                        submenu.value
                                                                    }
                                                                >
                                                                    {
                                                                        submenu.title
                                                                    }
                                                                </a>
                                                            </MenubarItem>
                                                        ),
                                                    )}
                                                </MenubarContent>
                                            </MenubarPortal>
                                        )}
                                    </MenubarMenu>
                                );
                            })}

                        <MenubarMenu>
                            <MenubarTrigger className="capitalize">
                                {theme}
                            </MenubarTrigger>
                            <MenubarPortal>
                                <MenubarContent>
                                    {AvailableTheme.map((item, index) => (
                                        <MenubarItem asChild key={index}>
                                            <button
                                                className="w-full"
                                                onClick={(e) => {
                                                    setTheme(
                                                        item.value as Theme,
                                                    );
                                                    window.location.reload();
                                                }}
                                            >
                                                {item.title}
                                            </button>
                                        </MenubarItem>
                                    ))}
                                </MenubarContent>
                            </MenubarPortal>
                        </MenubarMenu>

                        {user !== null && (
                            <MenubarMenu>
                                <MenubarTrigger>
                                    <CircleUserRound className="w-5 h-5" />
                                </MenubarTrigger>
                                <MenubarPortal>
                                    <MenubarContent>
                                        {["profile", "log out"].map(
                                            (item, index) => {
                                                return (
                                                    <MenubarItem
                                                        key={index}
                                                        className="capitalize"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (
                                                                item ===
                                                                "log out"
                                                            )
                                                                logout();
                                                        }}
                                                    >
                                                        {item}
                                                    </MenubarItem>
                                                );
                                            },
                                        )}
                                    </MenubarContent>
                                </MenubarPortal>
                            </MenubarMenu>
                        )}
                    </div>
                </Menubar>
            </nav>
            {children}
        </React.Fragment>
    );
}
