import { useOrderById } from "@/services/Orders/OrdersApi";
import { useParams } from "react-router";
import OrderDetailView from "./OrderDetailView";

export default function OrderDetails() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useOrderById({ id: Number(id) });

    return <OrderDetailView data={data?.data} isLoading={isLoading} />;
}
