import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PromoType } from "@/services/Promos/PromosApi";
import { usePublishPromo } from "@/services/Promos/PromosApi";

type PromoDetailViewProps = {
    data?: PromoType;
    isLoading?: boolean;
};

const STATUS_BADGE: Record<string, "default" | "secondary" | "outline"> = {
    draft: "secondary",
    scheduled: "outline",
    published: "default",
    archived: "secondary",
};

export default function PromoDetailView({
    data,
    isLoading,
}: PromoDetailViewProps) {
    const navigate = useNavigate();
    const publishMutation = usePublishPromo();

    const handleEdit = React.useCallback(() => {
        navigate(`/dashboard/promos/${data?.id}/edit`);
    }, [navigate, data?.id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">Loading...</span>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">Promo not found</span>
            </div>
        );
    }

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Promo Details
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg overflow-auto">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/promos")}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Promos
                    </Button>
                    <div className="flex gap-2">
                        {data.status === "draft" && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                    publishMutation.mutate(data.id)
                                }
                                disabled={publishMutation.isPending}
                                className="gap-2"
                            >
                                <Send className="size-4" />
                                Publish
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEdit}
                            className="gap-2"
                        >
                            <Pencil className="size-4" />
                            Edit
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="details" className="h-full flex flex-col">
                    <TabsList className="w-fit p-1">
                        <TabsTrigger value="details" className="px-4 py-2">
                            Details
                        </TabsTrigger>
                        <TabsTrigger value="campaigns" className="px-4 py-2">
                            Campaigns
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="details"
                        className="flex-1 p-6 space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Title
                                </span>
                                <p className="text-lg font-medium">
                                    {data.title}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Status
                                </span>
                                <Badge
                                    variant={
                                        STATUS_BADGE[data.status] ?? "secondary"
                                    }
                                    className="capitalize"
                                >
                                    {data.status}
                                </Badge>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <span className="text-sm text-muted-foreground">
                                    Description
                                </span>
                                <p className="text-base">
                                    {data.description || "No description"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Scheduled At
                                </span>
                                <p className="text-lg font-medium">
                                    {data.scheduled_at
                                        ? new Date(
                                              data.scheduled_at,
                                          ).toLocaleDateString()
                                        : "Not scheduled"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Published At
                                </span>
                                <p className="text-lg font-medium">
                                    {data.published_at
                                        ? new Date(
                                              data.published_at,
                                          ).toLocaleDateString()
                                        : "Not published"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    CTA Label
                                </span>
                                <p className="text-lg font-medium">
                                    {data.cta_label || "None"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    CTA URL
                                </span>
                                <p className="text-lg font-medium">
                                    {data.cta_url ? (
                                        <a
                                            href={data.cta_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary underline"
                                        >
                                            {data.cta_url}
                                        </a>
                                    ) : (
                                        "None"
                                    )}
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value="campaigns"
                        className="flex-1 p-6 space-y-6"
                    >
                        {data.campaigns && data.campaigns.length > 0 ? (
                            <div className="space-y-3">
                                {data.campaigns.map((campaign) => (
                                    <div
                                        key={campaign.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {campaign.subject}
                                            </p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {campaign.status}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                navigate(
                                                    `/dashboard/campaigns/${campaign.id}`,
                                                )
                                            }
                                        >
                                            View
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-32 border border-dashed rounded-lg">
                                <span className="text-muted-foreground">
                                    No campaigns linked to this promo yet
                                </span>
                            </div>
                        )}
                        <Button
                            variant="default"
                            onClick={() =>
                                navigate(
                                    `/dashboard/campaigns/create?promo_id=${data.id}`,
                                )
                            }
                        >
                            Create Campaign for this Promo
                        </Button>
                    </TabsContent>
                </Tabs>
            </section>
        </main>
    );
}
