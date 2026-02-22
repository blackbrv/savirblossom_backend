import "./bootstrap";
import "../css/app.css";
import ReactDOM from "react-dom/client";
import Root from "./src/root";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/ui/theme-provider";
import Navbar from "./components/ui/Navbar";
import Footer from "./components/ui/Footer";
import { Toaster } from "./components/ui/sonner";

const element = document.getElementById("root");
const root = ReactDOM.createRoot(element as HTMLElement);
root.render(
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
            <Root />
            <Toaster />
        </TooltipProvider>
    </ThemeProvider>,
);

export {};
