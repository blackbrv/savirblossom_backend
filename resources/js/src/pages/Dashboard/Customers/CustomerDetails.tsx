import { useCustomerById } from "@/services/Customers/CustomersApi";
import { useParams } from "react-router";
import CustomerDetailView from "./CustomerDetailView";

export default function CustomerDetails() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useCustomerById({ id: Number(id) });

    return <CustomerDetailView data={data?.data} isLoading={isLoading} />;
}
