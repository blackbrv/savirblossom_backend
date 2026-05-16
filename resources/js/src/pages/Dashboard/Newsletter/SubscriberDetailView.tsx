import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    useSubscriber,
    useDeleteSubscriber,
    useToggleSubscriber,
} from "@/services/Newsletter/SubscribersApi";
import DeleteConfirmationDialog from "@/src/components/ui/DeleteConfirmationDialog";

export default function SubscriberDetailView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const subscriberId = Number(id);

    const { data, isLoading } = useSubscriber(subscriberId);
    const deleteMutation = useDeleteSubscriber();
    const toggleMutation = useToggleSubscriber();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    const handleDeleteConfirm = async () => {
        try {
            await deleteMutation.mutateAsync(subscriberId);
            setDeleteDialogOpen(false);
            navigate("/dashboard/newsletter");
        } catch {}
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">Loading...</span>
            </div>
        );
    }

    const subscriber = data?.data;

    if (!subscriber) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">
                    Subscriber not found
                </span>
            </div>
        );
    }

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Subscriber Details
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/newsletter")}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Subscribers
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                toggleMutation.mutate(subscriberId)
                            }
                            className="gap-2"
                        >
                            {subscriber.is_subscribed
                                ? "Unsubscribe"
                                : "Subscribe"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteDialogOpen(true)}
                            disabled={deleteMutation.isPending}
                            className="gap-2 text-destructive hover:text-destructive"
                        >
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                    <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">
                            Email
                        </span>
                        <p className="text-lg font-medium">
                            {subscriber.email}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">
                            Name
                        </span>
                        <p className="text-lg font-medium">
                            {subscriber.name ?? "-"}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">
                            Status
                        </span>
                        <Badge
                            variant={
                                subscriber.is_subscribed
                                    ? "default"
                                    : "secondary"
                            }
                        >
                            {subscriber.is_subscribed
                                ? "Subscribed"
                                : "Unsubscribed"}
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">
                            Subscribed At
                        </span>
                        <p className="text-lg font-medium">
                            {subscriber.subscribed_at
                                ? new Date(
                                      subscriber.subscribed_at,
                                  ).toLocaleDateString()
                                : "-"}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">
                            Unsubscribed At
                        </span>
                        <p className="text-lg font-medium">
                            {subscriber.unsubscribed_at
                                ? new Date(
                                      subscriber.unsubscribed_at,
                                  ).toLocaleDateString()
                                : "-"}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">
                            Last Promo Sent
                        </span>
                        <p className="text-lg font-medium">
                            {subscriber.last_promo_sent_at
                                ? new Date(
                                      subscriber.last_promo_sent_at,
                                  ).toLocaleDateString()
                                : "Never"}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">
                            Created
                        </span>
                        <p className="text-lg font-medium">
                            {new Date(
                                subscriber.created_at,
                            ).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </section>

            <DeleteConfirmationDialog
                title="Delete Subscriber"
                description={`Are you sure you want to delete "${subscriber.email}"?`}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                isLoading={deleteMutation.isPending}
            />
        </main>
    );
}
