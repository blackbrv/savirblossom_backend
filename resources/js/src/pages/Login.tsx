import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/UserProvider";

export default function Login() {
    const { login } = useUser();

    const handleSubmit = React.useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const obj = Object.fromEntries(formData);

            if (obj.username && obj.password) {
                const { username, password } = obj;

                login(username as string, password as string);
            }
        },
        [],
    );

    return (
        <main className="h-screen mx-auto container flex items-center justify-center p-6">
            <div className="w-max bg-background rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-accent">
                {/* Left Side */}
                <div className="relative hidden md:flex items-end p-10 bg-gradient-to-br dark:from-purple-700 dark:to-indigo-900 from-purple-500 to-indigo-500">
                    <div className="absolute inset-0 bg-background/30" />

                    <div className="relative z-10 text-foreground">
                        <h1 className="text-3xl font-semibold leading-snug">
                            Capturing Moments,
                            <br />
                            Creating Memories
                        </h1>
                    </div>
                </div>

                {/* Right Side */}
                <div className="p-10 text-foreground flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-3xl font-semibold mb-2">
                            Login to your account
                        </h2>
                        <p className="text-sm text-accent-foreground">
                            Welcome back 👋
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-6"
                    >
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-accent-foreground">
                                Username or Email
                            </label>
                            <Input name="username" type="text" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-accent-foreground">
                                Password
                            </label>
                            <Input name="password" type="password" />
                        </div>

                        <Button type="submit">Login</Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-accent-foreground" />
                        <span className="text-sm text-accent-foreground">
                            Or continue with
                        </span>
                        <div className="flex-1 h-px bg-accent-foreground" />
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" className="w-full">
                            <div className="relative w-4 h-4">
                                <img
                                    src={
                                        "https://www.svgrepo.com/show/303108/google-icon-logo.svg"
                                    }
                                    alt="google-logo"
                                    className="w-4 h-4"
                                    width={200}
                                    height={200}
                                />
                            </div>
                            Google
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
