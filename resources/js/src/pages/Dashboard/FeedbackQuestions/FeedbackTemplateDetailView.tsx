import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    useFeedbackTemplate,
    useDeleteFeedbackTemplate,
} from "@/services/Feedback/FeedbackQuestionsApi";
import DeleteConfirmationDialog from "@/src/components/ui/DeleteConfirmationDialog";

export default function FeedbackTemplateDetailView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const templateId = Number(id);

    const { data, isLoading } = useFeedbackTemplate(templateId);
    const deleteMutation = useDeleteFeedbackTemplate();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteMutation.mutateAsync(templateId);
            setDeleteDialogOpen(false);
            navigate("/dashboard/feedback/questions");
        } catch {
            // Error handled by mutation
        }
    };

    const getQuestionTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            star_rating: "Star Rating",
            text: "Text",
            yes_no: "Yes/No",
            yes_no_reason: "Yes/No + Reason",
        };
        return labels[type] || type;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">Loading...</span>
            </div>
        );
    }

    const template = data?.data;

    if (!template) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">
                    Template not found
                </span>
            </div>
        );
    }

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Feedback Template Details
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg overflow-auto">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            navigate("/dashboard/feedback/questions")
                        }
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Templates
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                        <span className="text-sm text-muted-foreground">
                            ID
                        </span>
                        <p className="text-lg font-medium">#{template.id}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Name
                        </span>
                        <p className="text-lg font-medium">{template.name}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Description
                        </span>
                        <p className="text-base">
                            {template.description || "No description"}
                        </p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Status
                        </span>
                        <p>
                            <span
                                className={`px-2 py-1 text-xs rounded ${
                                    template.is_active
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                            >
                                {template.is_active ? "Active" : "Inactive"}
                            </span>
                        </p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Default
                        </span>
                        <p>
                            {template.is_default && (
                                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                                    Default
                                </span>
                            )}
                        </p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Questions Count
                        </span>
                        <p className="text-lg font-medium">
                            {template.questions?.length ?? 0}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-lg font-medium">Questions</h4>
                    {template.questions && template.questions.length > 0 ? (
                        <ul className="space-y-3">
                            {template.questions.map((q, idx) => (
                                <li
                                    key={q.id}
                                    className="flex items-start gap-3 p-4 border rounded-lg"
                                >
                                    <span className="text-sm text-muted-foreground w-6">
                                        {idx + 1}.
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {q.question_text}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Type:{" "}
                                            {getQuestionTypeLabel(
                                                q.question_type,
                                            )}
                                            {q.is_required && " • Required"}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">
                            No questions yet
                        </p>
                    )}
                </div>
            </section>

            <DeleteConfirmationDialog
                title="Delete Template"
                description={`Are you sure you want to delete "${template.name}"? This will also delete all questions in this template.`}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                isLoading={deleteMutation.isPending}
            />
        </main>
    );
}
