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
import Customers from "./pages/Dashboard/Customers";
import CustomerCreate from "./pages/Dashboard/Customers/CustomerCreate";
import CustomerDetails from "./pages/Dashboard/Customers/CustomerDetails";
import CustomerEdit from "./pages/Dashboard/Customers/CustomerEdit";
import Orders from "./pages/Dashboard/Orders/Orders";
import OrderCreate from "./pages/Dashboard/Orders/OrderCreate";
import OrderDetails from "./pages/Dashboard/Orders/OrderDetails";
import OrderEdit from "./pages/Dashboard/Orders/OrderEdit";

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
                            path="/dashboard/customers"
                            element={<Customers />}
                        />
                        <Route
                            path="/dashboard/customers/create"
                            element={<CustomerCreate />}
                        />
                        <Route
                            path="/dashboard/customers/:id"
                            element={<CustomerDetails />}
                        />
                        <Route
                            path="/dashboard/customers/:id/edit"
                            element={<CustomerEdit />}
                        />
                        <Route
                            path="/dashboard/categories/:id/edit"
                            element={<CategoriesEdit />}
                        />
                        <Route path="/dashboard/orders" element={<Orders />} />
                        <Route
                            path="/dashboard/orders/create"
                            element={<OrderCreate />}
                        />
                        <Route
                            path="/dashboard/orders/:id"
                            element={<OrderDetails />}
                        />
                        <Route
                            path="/dashboard/orders/:id/edit"
                            element={<OrderEdit />}
                        />
                    </Routes>
                    <Footer />
                </Navbar>
            </UserProvider>
        </BrowserRouter>
    );
}
