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
import OrderDetailView from "./pages/Dashboard/Orders/OrderDetailView";
import OrderEdit from "./pages/Dashboard/Orders/OrderEdit";
import FeedbackQuestions from "./pages/Dashboard/FeedbackQuestions/FeedbackQuestions";
import FeedbackQuestionsCreate from "./pages/Dashboard/FeedbackQuestions/FeedbackQuestionsCreate";
import FeedbackQuestionsEdit from "./pages/Dashboard/FeedbackQuestions/FeedbackQuestionsEdit";
import FeedbackTemplateDetailView from "./pages/Dashboard/FeedbackQuestions/FeedbackTemplateDetailView";
import Discounts from "./pages/Dashboard/Discounts/Discounts";
import DiscountDetails from "./pages/Dashboard/Discounts/DiscountDetails";
import DiscountCreate from "./pages/Dashboard/Discounts/DiscountCreate";
import DiscountEdit from "./pages/Dashboard/Discounts/DiscountEdit";
import FeedbackResponses from "./pages/Dashboard/Feedback/FeedbackResponses";
import FeedbackDetailView from "./pages/Dashboard/Feedback/FeedbackDetailView";
import FeedbackEdit from "./pages/Dashboard/Feedback/FeedbackEdit";

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
                            element={<OrderDetailView />}
                        />
                        <Route
                            path="/dashboard/orders/:id/edit"
                            element={<OrderEdit />}
                        />
                        <Route
                            path="/dashboard/feedback"
                            element={<FeedbackResponses />}
                        />
                        <Route
                            path="/dashboard/feedback/:id"
                            element={<FeedbackDetailView />}
                        />
                        <Route
                            path="/dashboard/feedback/:id/edit"
                            element={<FeedbackEdit />}
                        />
                        <Route
                            path="/dashboard/feedback/questions"
                            element={<FeedbackQuestions />}
                        />
                        <Route
                            path="/dashboard/feedback/questions/:id"
                            element={<FeedbackTemplateDetailView />}
                        />
                        <Route
                            path="/dashboard/feedback/questions/create"
                            element={<FeedbackQuestionsCreate />}
                        />
                        <Route
                            path="/dashboard/feedback/questions/:id/edit"
                            element={<FeedbackQuestionsEdit />}
                        />
                        <Route
                            path="/dashboard/discount"
                            element={<Discounts />}
                        />
                        <Route
                            path="/dashboard/discount/create"
                            element={<DiscountCreate />}
                        />
                        <Route
                            path="/dashboard/discount/:id"
                            element={<DiscountDetails />}
                        />
                        <Route
                            path="/dashboard/discount/:id/edit"
                            element={<DiscountEdit />}
                        />
                    </Routes>
                    <Footer />
                </Navbar>
            </UserProvider>
        </BrowserRouter>
    );
}
