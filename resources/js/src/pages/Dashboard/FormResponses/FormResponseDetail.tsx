import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    useFormResponse,
    useDeleteFormResponse,
} from "@/services/Forms/FormResponsesApi";
import DeleteConfirmationDialog from "@/src/components/ui/DeleteConfirmationDialog";

export default function FormResponseDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const responseId = Number(id);

    const { data, isLoading } = useFormResponse(responseId);
    const deleteMutation = useDeleteFormResponse();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteMutation.mutateAsync(responseId);
            setDeleteDialogOpen(false);
            navigate("/dashboard/form-responses");
        } catch {
            // Error handled by mutation
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">Loading...</span>
            </div>
        );
    }

    const submission = data?.data;

    if (!submission) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">
                    Submission not found
                </span>
            </div>
        );
    }

    return (
        <main className="min-h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Form Response Details
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/form-responses")}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Responses
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
                                #{submission.id}
                            </p>
                        </Card>

                        <Card className="p-4">
                            <span className="text-sm text-muted-foreground">
                                Form
                            </span>
                            <p className="text-lg font-medium">
                                {submission.form?.name ?? "-"}
                            </p>
                        </Card>

                        <Card className="p-4">
                            <span className="text-sm text-muted-foreground">
                                Customer
                            </span>
                            <p className="text-lg font-medium">
                                {submission.customer
                                    ? `${submission.customer.username} (${submission.customer.email})`
                                    : "Guest"}
                            </p>
                        </Card>

                        <Card className="p-4">
                            <span className="text-sm text-muted-foreground">
                                Submitted At
                            </span>
                            <p className="text-lg font-medium">
                                {new Date(
                                    submission.submitted_at,
                                ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </Card>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-lg font-medium">Answers</h4>
                        {submission.answers && submission.answers.length > 0 ? (
                            <div className="space-y-3">
                                {submission.answers.map((answer) => (
                                    <Card key={answer.id} className="p-4">
                                        <div className="space-y-2">
                                            {answer.question && (
                                                <span className="text-sm text-muted-foreground">
                                                    {answer.question.label}
                                                </span>
                                            )}
                                            <div className="text-base">
                                                {answer.value ?? (
                                                    <span className="text-muted-foreground">
                                                        -
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">
                                No answers available
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <DeleteConfirmationDialog
                title="Delete Response"
                description="Are you sure you want to delete this form response?"
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                isLoading={deleteMutation.isPending}
            />
        </main>
    );
}
