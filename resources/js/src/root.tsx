import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import DashboardHome from "./pages/Dashboard/DashboardHome";
import { UserProvider } from "@/hooks/UserProvider";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import DashboardBouquet from "./pages/Dashboard/DashboardBouquet";

export default function Root() {
    return (
        <BrowserRouter>
            <UserProvider
                storageKey={{
                    userName: "vite-username",
                    password: "vite-password",
                }}
            >
                <Navbar>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={<DashboardHome />} />
                        <Route
                            path="/dashboard/bouquet"
                            element={<DashboardBouquet />}
                        />
                        <Route
                            path="/dashboard/categories"
                            element={<DashboardHome />}
                        />
                    </Routes>
                    <Footer />
                </Navbar>
            </UserProvider>
        </BrowserRouter>
    );
}
