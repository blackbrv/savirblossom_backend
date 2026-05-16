import { useParams } from "react-router";
import { usePromo } from "@/services/Promos/PromosApi";
import PromoDetailView from "./PromoDetailView";

export default function PromoDetails() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = usePromo(Number(id));

    return <PromoDetailView data={data?.data} isLoading={isLoading} />;
}
