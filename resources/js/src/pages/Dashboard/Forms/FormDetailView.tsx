import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm, useDeleteForm } from "@/services/Forms/FormsApi";
import DeleteConfirmationDialog from "@/src/components/ui/DeleteConfirmationDialog";

const QUESTION_TYPE_LABELS: Record<string, string> = {
    text: "Text Input",
    textarea: "Text Area",
    number: "Number",
    boolean: "Yes / No",
    select: "Select (Dropdown)",
    radio: "Radio Buttons",
    checkbox: "Checkboxes",
    email: "Email",
    phone: "Phone",
    date: "Date",
};

export default function FormDetailView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const formId = Number(id);

    const { data, isLoading } = useForm(formId);
    const deleteMutation = useDeleteForm();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteMutation.mutateAsync(formId);
            setDeleteDialogOpen(false);
            navigate("/dashboard/form-builder");
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

    const form = data?.data;

    if (!form) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">Form not found</span>
            </div>
        );
    }

    return (
        <main className="min-h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Form Details
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg overflow-auto">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/form-builder")}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Forms
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
                        <p className="text-lg font-medium">#{form.id}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Name
                        </span>
                        <p className="text-lg font-medium">{form.name}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Description
                        </span>
                        <p className="text-base">
                            {form.description || "No description"}
                        </p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Status
                        </span>
                        <p>
                            <span
                                className={`px-2 py-1 text-xs rounded ${
                                    form.is_active
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                            >
                                {form.is_active ? "Active" : "Inactive"}
                            </span>
                        </p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Questions Count
                        </span>
                        <p className="text-lg font-medium">
                            {form.questions?.length ?? 0}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-lg font-medium">Questions</h4>
                    {form.questions && form.questions.length > 0 ? (
                        <ul className="space-y-3">
                            {form.questions.map((q, idx) => (
                                <li
                                    key={q.id}
                                    className="flex items-start gap-3 p-4 border rounded-lg"
                                >
                                    <span className="text-sm text-muted-foreground w-6">
                                        {idx + 1}.
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {q.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Type:{" "}
                                            {QUESTION_TYPE_LABELS[
                                                q.question_type
                                            ] ?? q.question_type}
                                            {q.is_required && " • Required"}
                                        </p>
                                        {q.options && q.options.length > 0 && (
                                            <ul className="mt-2 space-y-1">
                                                {q.options.map((opt) => (
                                                    <li
                                                        key={opt.id}
                                                        className="text-xs text-muted-foreground flex items-center gap-2"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                                                        {opt.label}
                                                        {opt.value && (
                                                            <span className="text-muted-foreground/60">
                                                                ({opt.value})
                                                            </span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
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
                title="Delete Form"
                description={`Are you sure you want to delete "${form.name}"? This will also delete all questions in this form.`}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                isLoading={deleteMutation.isPending}
            />
        </main>
    );
}
