import { useCoupon } from "@/services/Coupons/CouponsApi";
import { useParams } from "react-router";
import DiscountDetailView from "./DiscountDetailView";

export default function DiscountDetails() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useCoupon(Number(id));

    return <DiscountDetailView data={data?.data} isLoading={isLoading} />;
}
