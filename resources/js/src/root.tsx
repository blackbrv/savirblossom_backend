import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import DashboardHome from "./pages/Dashboard/DashboardHome";
import { UserProvider } from "@/hooks/UserProvider";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Bouquets from "./pages/Dashboard/Bouquet/Bouquets";
import BouquetDetails from "./pages/Dashboard/Bouquet/BouquetDetails";
import BouquetEdit from "./pages/Dashboard/Bouquet/BouquetEdit";
import BouquetCreate from "./pages/Dashboard/Bouquet/BouquetCreate";
import Categories from "./pages/Dashboard/Categories";
import CategoriesCreate from "./pages/Dashboard/CategoriesCreate";
import CategoriesEdit from "./pages/Dashboard/CategoriesEdit";

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
                            element={<Bouquets />}
                        />
                        <Route
                            path="/dashboard/bouquet/create"
                            element={<BouquetCreate />}
                        />
                        <Route
                            path="/dashboard/bouquet/:id"
                            element={<BouquetDetails />}
                        />
                        <Route
                            path="/dashboard/bouquet/:id/edit"
                            element={<BouquetEdit />}
                        />
                        <Route
                            path="/dashboard/categories"
                            element={<Categories />}
                        />
                        <Route
                            path="/dashboard/categories/create"
                            element={<CategoriesCreate />}
                        />
                        <Route
                            path="/dashboard/categories/:id/edit"
                            element={<CategoriesEdit />}
                        />
                    </Routes>
                    <Footer />
                </Navbar>
            </UserProvider>
        </BrowserRouter>
    );
}
