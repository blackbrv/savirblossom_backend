import { useBouquetDetails } from "@/services/Bouquets/BouquetsApi";
import { useParams } from "react-router";
import BouquetDetailView from "./BouquetDetailView";

export default function BouquetDetails() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useBouquetDetails({ id: Number(id) });

    return <BouquetDetailView data={data} isLoading={isLoading} />;
}
