import { useParams } from "react-router";
import { useCampaign } from "@/services/Campaigns/CampaignsApi";
import CampaignDetailView from "./CampaignDetailView";

export default function CampaignDetails() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useCampaign(Number(id));

    return <CampaignDetailView data={data?.data} isLoading={isLoading} />;
}
