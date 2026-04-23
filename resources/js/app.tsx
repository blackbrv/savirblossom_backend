import "./bootstrap";
import "../css/app.css";
import ReactDOM from "react-dom/client";
import Root from "./src/root";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const element = document.getElementById("root");
const root = ReactDOM.createRoot(element as HTMLElement);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // the query will not refetch on window focus.
            refetchOnWindowFocus: false,
            // failed queries will not retry by default.
            retry: false,
            // query will always fetch and ignore the online / offline state.
            networkMode: "always",
        },
        mutations: {
            // failed mutations will not retry.
            retry: false,
            // query will always fetch and ignore the online / offline state.
            networkMode: "always",
        },
    },
});

root.render(
    <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <TooltipProvider>
                <Root />
                <Toaster />
            </TooltipProvider>
        </ThemeProvider>
    </QueryClientProvider>,
);

export {};
