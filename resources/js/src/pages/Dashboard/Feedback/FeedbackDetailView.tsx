import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    useFeedbackResponse,
    useDeleteFeedback,
    FeedbackResponseType,
} from "@/services/Feedback/FeedbackApi";
import DeleteConfirmationDialog from "@/src/components/ui/DeleteConfirmationDialog";

export default function FeedbackDetailView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const feedbackId = Number(id);

    const { data, isLoading } = useFeedbackResponse(feedbackId);
    const deleteMutation = useDeleteFeedback();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteMutation.mutateAsync(feedbackId);
            setDeleteDialogOpen(false);
            navigate("/dashboard/feedback");
        } catch {
            // Error handled by mutation
        }
    };

    const renderAnswer = (answer: FeedbackResponseType["answers"][0]) => {
        if (answer.rating_value) {
            return (
                <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                        <span
                            key={i}
                            className={
                                i < answer.rating_value!
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                            }
                        >
                            ★
                        </span>
                    ))}
                    <span className="ml-2 text-sm">
                        ({answer.rating_value}/5)
                    </span>
                </div>
            );
        }

        if (answer.boolean_value !== null) {
            return (
                <span
                    className={
                        answer.boolean_value ? "text-green-600" : "text-red-600"
                    }
                >
                    {answer.boolean_value ? "Yes" : "No"}
                    {answer.reason_value && ` - ${answer.reason_value}`}
                </span>
            );
        }

        if (answer.text_value) {
            return <span>{answer.text_value}</span>;
        }

        return <span className="text-muted-foreground">-</span>;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">Loading...</span>
            </div>
        );
    }

    const feedback = data?.data;

    if (!feedback) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">
                    Feedback not found
                </span>
            </div>
        );
    }

    return (
        <main className="min-h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Feedback Details
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/feedback")}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to List
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteClick}
                        disabled={deleteMutation.isPending}
                        className="gap-2 text-destructive hover:text-destructive"
                    >
                        <Trash2 className="size-4" />
                        Delete
                    </Button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4">
                            <span className="text-sm text-muted-foreground">
                                ID
                            </span>
                            <p className="text-lg font-medium">
                                #{feedback.id}
                            </p>
                        </Card>

                        <Card className="p-4">
                            <span className="text-sm text-muted-foreground">
                                Customer
                            </span>
                            <p className="text-lg font-medium">
                                {feedback.customer
                                    ? `${feedback.customer.username} (${feedback.customer.email})`
                                    : "Guest"}
                            </p>
                        </Card>

                        <Card className="p-4">
                            <span className="text-sm text-muted-foreground">
                                Order
                            </span>
                            <p className="text-lg font-medium">
                                {feedback.order ? `#${feedback.order.id}` : "-"}
                            </p>
                        </Card>

                        <Card className="p-4">
                            <span className="text-sm text-muted-foreground">
                                Bouquet
                            </span>
                            <p className="text-lg font-medium">
                                {feedback.bouquet?.name || "-"}
                            </p>
                        </Card>

                        <Card className="p-4">
                            <span className="text-sm text-muted-foreground">
                                Rating
                            </span>
                            <div className="flex items-center gap-2">
                                {feedback.average_rating ? (
                                    <>
                                        <span className="text-yellow-500 text-lg">
                                            ★
                                        </span>
                                        <span className="text-lg font-medium">
                                            {feedback.average_rating.toFixed(1)}
                                            /5
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-lg font-medium">
                                        -
                                    </span>
                                )}
                            </div>
                        </Card>

                        <Card className="p-4">
                            <span className="text-sm text-muted-foreground">
                                Date
                            </span>
                            <p className="text-lg font-medium">
                                {new Date(
                                    feedback.created_at,
                                ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        </Card>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-lg font-medium">Answers</h4>
                        {feedback.answers && feedback.answers.length > 0 ? (
                            <div className="space-y-3">
                                {feedback.answers.map((answer) => (
                                    <Card key={answer.id} className="p-4">
                                        <div className="space-y-2">
                                            {answer.question && (
                                                <span className="text-sm text-muted-foreground">
                                                    {
                                                        answer.question
                                                            .question_text
                                                    }
                                                </span>
                                            )}
                                            <div className="text-base">
                                                {renderAnswer(answer)}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">
                                No answers yet
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <DeleteConfirmationDialog
                title="Delete Feedback"
                description="Are you sure you want to delete this feedback response?"
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                isLoading={deleteMutation.isPending}
            />
        </main>
    );
}
