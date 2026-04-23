import React from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export type User = "admin" | "user" | null;

type UserProviderProps = {
    children?: React.ReactNode | React.ReactNode[];
    storageKey: {
        userName: string;
        password: string;
    };
};

type UserProviderState = {
    user: User | null;
    setUser: (user: User) => void;
    login: (username: string, password: string) => void;
    logout: () => void;
};

const initialState: UserProviderState = {
    user: null,
    setUser: () => null,
    login: () => null,
    logout: () => null,
};

const UserProviderContext =
    React.createContext<UserProviderState>(initialState);

export function UserProvider({
    children,
    storageKey = {
        userName: "vite-username",
        password: "vite-password",
    },
    ...props
}: UserProviderProps) {
    const [user, setUser] = React.useState<User>(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        const username = localStorage.getItem(storageKey.userName);
        const password = localStorage.getItem(storageKey.password);

        if (username === "admin" && password === "admin") {
            setUser("admin");

            return;
        }

        setUser(null);
        navigate("/login");
    }, []);

    const handleLogin = React.useCallback(
        (username: string, password: string) => {
            try {
                localStorage.setItem(storageKey.userName, username);
                localStorage.setItem(storageKey.password, password);

                if (username === "admin" && password === "admin") {
                    toast.success("Logged in successfully", {
                        position: "top-center",
                    });

                    setUser("admin");
                    navigate("/dashboard");
                }
            } catch (err) {
                console.error(err);
            }
        },
        [storageKey],
    );

    const handleLogout = React.useCallback(() => {
        localStorage.removeItem(storageKey.userName);
        localStorage.removeItem(storageKey.password);

        setUser(null);
        navigate("/login");
        toast.success("Logged out successfully", {
            position: "top-center",
        });
    }, [storageKey]);

    const value: UserProviderState = {
        user,
        setUser,
        login: handleLogin,
        logout: handleLogout,
    };

    return (
        <UserProviderContext.Provider value={value} {...props}>
            {children}
        </UserProviderContext.Provider>
    );
}

export const useUser = () => {
    const context = React.useContext(UserProviderContext);

    if (!context) throw new Error("useUser must be used within a UserProvider");

    return context;
};
