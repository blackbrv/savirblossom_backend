import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CampaignType } from "@/services/Campaigns/CampaignsApi";
import { useQueueCampaign } from "@/services/Campaigns/CampaignsApi";

type CampaignDetailViewProps = {
    data?: CampaignType;
    isLoading?: boolean;
};

const STATUS_BADGE: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    draft: "secondary",
    queued: "outline",
    sending: "default",
    sent: "default",
    failed: "destructive",
    cancelled: "secondary",
};

const QUEUEABLE_STATUSES = ["draft", "failed", "cancelled"];

export default function CampaignDetailView({
    data,
    isLoading,
}: CampaignDetailViewProps) {
    const navigate = useNavigate();
    const queueMutation = useQueueCampaign();

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
                <span className="text-muted-foreground">
                    Campaign not found
                </span>
            </div>
        );
    }

    const sentPercent =
        data.total_recipients > 0
            ? Math.round((data.sent_count / data.total_recipients) * 100)
            : 0;

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Campaign Details
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
                    {QUEUEABLE_STATUSES.includes(data.status) && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => queueMutation.mutate(data.id)}
                            disabled={queueMutation.isPending}
                            className="gap-2"
                        >
                            <Play className="size-4" />
                            Queue for Sending
                        </Button>
                    )}
                </div>

                <Tabs defaultValue="details" className="h-full flex flex-col">
                    <TabsList className="w-fit p-1">
                        <TabsTrigger value="details" className="px-4 py-2">
                            Details
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="px-4 py-2">
                            Stats
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="details"
                        className="flex-1 p-6 space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Subject
                                </span>
                                <p className="text-lg font-medium">
                                    {data.subject}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Status
                                </span>
                                <Badge
                                    variant={
                                        STATUS_BADGE[data.status] ??
                                        "secondary"
                                    }
                                    className="capitalize"
                                >
                                    {data.status}
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Promo
                                </span>
                                <p className="text-lg font-medium">
                                    {data.promo?.title ?? "-"}
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
                                          ).toLocaleString()
                                        : "Not scheduled"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Sent At
                                </span>
                                <p className="text-lg font-medium">
                                    {data.sent_at
                                        ? new Date(
                                              data.sent_at,
                                          ).toLocaleString()
                                        : "Not sent"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Created
                                </span>
                                <p className="text-lg font-medium">
                                    {new Date(
                                        data.created_at,
                                    ).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <span className="text-sm text-muted-foreground">
                                    Email Body
                                </span>
                                <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-wrap text-sm">
                                    {data.email_body ||
                                        "No email body defined"}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value="stats"
                        className="flex-1 p-6 space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 border rounded-lg text-center">
                                <span className="text-sm text-muted-foreground">
                                    Total Recipients
                                </span>
                                <p className="text-3xl font-bold mt-2">
                                    {data.total_recipients}
                                </p>
                            </div>

                            <div className="p-6 border rounded-lg text-center">
                                <span className="text-sm text-muted-foreground">
                                    Sent
                                </span>
                                <p className="text-3xl font-bold mt-2 text-green-600">
                                    {data.sent_count}
                                </p>
                            </div>

                            <div className="p-6 border rounded-lg text-center">
                                <span className="text-sm text-muted-foreground">
                                    Failed
                                </span>
                                <p className="text-3xl font-bold mt-2 text-red-600">
                                    {data.failed_count}
                                </p>
                            </div>
                        </div>

                        {data.total_recipients > 0 && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>{sentPercent}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-3">
                                    <div
                                        className="bg-primary rounded-full h-3 transition-all"
                                        style={{
                                            width: `${sentPercent}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </section>
        </main>
    );
}
