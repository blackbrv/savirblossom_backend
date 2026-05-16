import React from "react";
import { useNavigate, useParams } from "react-router-dom";
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
    useCampaign,
    useUpdateCampaign,
} from "@/services/Campaigns/CampaignsApi";
import { usePromos } from "@/services/Promos/PromosApi";
import { formatDateTimeInput } from "@/utils";

type CampaignFormData = {
    promo_id: string;
    subject: string;
    email_body: string;
    scheduled_at: string;
    status: string;
};

export default function CampaignEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const campaignId = Number(id);

    const { data: campaignData, isLoading: isFetching } =
        useCampaign(campaignId);
    const { data: promosData } = usePromos({
        page: 1,
        perPage: 100,
    });
    const updateCampaignMutation = useUpdateCampaign();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CampaignFormData>({
        defaultValues: {
            promo_id: "",
            subject: "",
            email_body: "",
            scheduled_at: "",
            status: "draft",
        },
    });

    React.useEffect(() => {
        if (campaignData) {
            const c = campaignData.data;
            reset({
                promo_id: String(c.promo_id),
                subject: c.subject,
                email_body: c.email_body?.toString(),
                scheduled_at: formatDateTimeInput(c.scheduled_at),
                status: c.status,
            });
            // setValue("promo_id", c.promo_id.toString());
            // setValue("subject", c.subject);
            // setValue("email_body", c.email_body ?? "");
            // setValue("scheduled_at", c.scheduled_at ?? "");
        }
    }, [campaignData, reset]);

    const onSubmit = async (data: CampaignFormData) => {
        try {
            await updateCampaignMutation.mutateAsync({
                id: campaignId,
                data: {
                    promo_id: Number(data.promo_id),
                    subject: data.subject,
                    email_body: data.email_body || undefined,
                    scheduled_at: data.scheduled_at || undefined,
                    status: data.status,
                },
            });
            toast.success("Campaign updated successfully");
            navigate("/dashboard/campaigns");
        } catch {
            toast.error("Failed to update campaign");
        }
    };

    if (isFetching) {
        return (
            <main className="h-screen flex flex-col gap-8 justify-center p-6">
                <h3 className="desktop-tablet__heading__h3 text-primary">
                    Edit Campaign
                </h3>
                <p>Loading...</p>
            </main>
        );
    }

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Edit Campaign
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
                        Save Changes
                    </Button>
                </div>

                <form id="campaign-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="promo_id">Promo *</Label>
                            <Select
                                value={
                                    watch("promo_id")
                                        ? String(watch("promo_id"))
                                        : undefined
                                }
                                onValueChange={(val) => {
                                    if (val) {
                                        setValue("promo_id", val);
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a promo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {promosData?.data.map((promo) => (
                                        <SelectItem
                                            key={promo.id}
                                            value={String(promo.id)}
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

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={watch("status")}
                                onValueChange={(val) =>
                                    val && setValue("status", val)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="queued">
                                        Queued
                                    </SelectItem>
                                    <SelectItem value="sending">
                                        Sending
                                    </SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="failed">
                                        Failed
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
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
                            <Label htmlFor="scheduled_at">Schedule Date</Label>
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
