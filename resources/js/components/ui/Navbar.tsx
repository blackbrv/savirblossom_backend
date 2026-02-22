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

const NavigationList = [
    {
        title: "Dashboard",
        value: "/dashboard",
    },
];

export default function Navbar({
    children,
}: {
    children?: React.ReactNode | React.ReactNode[];
}) {
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
                                        <MenubarTrigger>
                                            {item.title}
                                        </MenubarTrigger>
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
                                        <MenubarItem
                                            key={index}
                                            onClick={(e) => {
                                                setTheme(item.value as Theme);
                                                window.location.reload();
                                            }}
                                        >
                                            {item.title}
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
