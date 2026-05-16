import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    useCreateCampaign,
    useCampaigns,
} from "@/services/Campaigns/CampaignsApi";
import { usePromos } from "@/services/Promos/PromosApi";

type CampaignFormData = {
    promo_id: string;
    subject: string;
    email_body: string;
    scheduled_at: string;
};

export default function CampaignCreate() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedPromoId = searchParams.get("promo_id");
    const createCampaignMutation = useCreateCampaign();
    const { data: promosData } = usePromos({ page: 1, perPage: 100 });

    const promos = promosData?.data ?? [];

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CampaignFormData>({
        defaultValues: {
            promo_id: preselectedPromoId ?? "",
            subject: "",
            email_body: "",
            scheduled_at: "",
        },
    });

    const onSubmit = async (data: CampaignFormData) => {
        try {
            const response = await createCampaignMutation.mutateAsync({
                promo_id: Number(data.promo_id),
                subject: data.subject,
                email_body: data.email_body || undefined,
                scheduled_at: data.scheduled_at || undefined,
            });
            toast.success("Campaign created successfully");
            navigate(`/dashboard/campaigns/${response.data.id}`);
        } catch {
            toast.error("Failed to create campaign");
        }
    };

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Create New Campaign
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg overflow-auto">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/campaigns")}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Campaigns
                    </Button>
                    <Button
                        type="submit"
                        form="campaign-form"
                        disabled={isSubmitting}
                    >
                        Create Campaign
                    </Button>
                </div>

                <form id="campaign-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="promo_id">Promo *</Label>
                            <Select
                                value={watch("promo_id")}
                                onValueChange={(val) =>
                                    setValue("promo_id", val)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a promo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {promos.map((promo) => (
                                        <SelectItem
                                            key={promo.id}
                                            value={promo.id.toString()}
                                        >
                                            {promo.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.promo_id && (
                                <p className="text-sm text-red-500">
                                    {errors.promo_id.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Email Subject *</Label>
                            <Input
                                id="subject"
                                {...register("subject", {
                                    required: "Subject is required",
                                })}
                                placeholder="e.g., Valentine's Day Special!"
                            />
                            {errors.subject && (
                                <p className="text-sm text-red-500">
                                    {errors.subject.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="email_body">Email Body</Label>
                            <Textarea
                                id="email_body"
                                {...register("email_body")}
                                placeholder="Email content (HTML supported)..."
                                rows={8}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="scheduled_at">
                                Schedule Date
                            </Label>
                            <Input
                                id="scheduled_at"
                                type="datetime-local"
                                {...register("scheduled_at")}
                            />
                        </div>
                    </div>
                </form>
            </section>
        </main>
    );
}
