import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    useFeedbackTemplate,
    useUpdateFeedbackTemplate,
    useDeleteFeedbackTemplate,
    useAddFeedbackQuestion,
    useUpdateFeedbackQuestion,
    useDeleteFeedbackQuestion,
    useReorderFeedbackQuestions,
    FeedbackQuestionType,
} from "@/services/Feedback/FeedbackQuestionsApi";
import { Plus, Trash2, ArrowUp, ArrowDown, Edit, Eye } from "lucide-react";
import DeleteConfirmationDialog from "@/src/components/ui/DeleteConfirmationDialog";

type TemplateFormData = {
    name: string;
    description: string;
    is_default: boolean;
    is_active: boolean;
};

type QuestionFormData = {
    question_text: string;
    question_type: "star_rating" | "text" | "yes_no" | "yes_no_reason";
    is_required: boolean;
};

export default function FeedbackQuestionsEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const templateId = Number(id);

    const { data, isLoading } = useFeedbackTemplate(templateId);
    const updateTemplateMutation = useUpdateFeedbackTemplate();
    const deleteTemplateMutation = useDeleteFeedbackTemplate();
    const addQuestionMutation = useAddFeedbackQuestion();
    const updateQuestionMutation = useUpdateFeedbackQuestion();
    const deleteQuestionMutation = useDeleteFeedbackQuestion();
    const reorderMutation = useReorderFeedbackQuestions();

    const [addDialogOpen, setAddDialogOpen] = React.useState(false);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [questionToEdit, setQuestionToEdit] =
        React.useState<FeedbackQuestionType | null>(null);

    const template = data?.data;

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TemplateFormData>({
        defaultValues: {
            name: "",
            description: "",
            is_default: false,
            is_active: true,
        },
    });

    const isDefault = watch("is_default");
    const isActive = watch("is_active");

    React.useEffect(() => {
        if (template) {
            reset({
                name: template.name,
                description: template.description ?? "",
                is_default: template.is_default,
                is_active: template.is_active,
            });
        }
    }, [template, reset]);

    const onSubmit = async (formData: TemplateFormData) => {
        try {
            await updateTemplateMutation.mutateAsync({
                id: templateId,
                data: {
                    name: formData.name,
                    description: formData.description || undefined,
                    is_default: formData.is_default,
                    is_active: formData.is_active,
                },
            });

            toast.success("Template updated successfully", {
                position: "top-center",
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddQuestion = async (data: QuestionFormData) => {
        try {
            await addQuestionMutation.mutateAsync({
                templateId,
                data,
            });
            setAddDialogOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditQuestion = async (data: QuestionFormData) => {
        if (!questionToEdit) return;
        try {
            await updateQuestionMutation.mutateAsync({
                templateId,
                questionId: questionToEdit.id,
                data,
            });
            setEditDialogOpen(false);
            setQuestionToEdit(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteQuestion = async () => {
        if (!questionToEdit) return;
        try {
            await deleteQuestionMutation.mutateAsync({
                templateId,
                questionId: questionToEdit.id,
            });
            setDeleteDialogOpen(false);
            setQuestionToEdit(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleMoveQuestion = async (
        index: number,
        direction: "up" | "down",
    ) => {
        if (!template?.questions) return;

        const questions = [...(template.questions ?? [])];
        const newIndex = direction === "up" ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= questions.length) return;

        const temp = questions[index]!;
        questions[index] = questions[newIndex]!;
        questions[newIndex] = temp;

        const order = questions.map((q) => q.id);

        try {
            await reorderMutation.mutateAsync({ templateId, order });
        } catch (error) {
            console.error(error);
        }
    };

    const getQuestionTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            star_rating: "Star Rating (1-5)",
            text: "Text Area",
            yes_no: "Yes/No",
            yes_no_reason: "Yes/No with Reason",
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
        <main className="min-h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Edit Feedback Template
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
                        type="submit"
                        form="template-form"
                        disabled={isSubmitting}
                    >
                        Save Changes
                    </Button>
                </div>

                <form
                    id="template-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <Label htmlFor="name">Template Name *</Label>
                        <Input
                            id="name"
                            {...register("name", {
                                required: "Name is required",
                            })}
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && (
                            <span className="text-sm text-destructive">
                                {errors.name.message}
                            </span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <Switch
                                id="is_active"
                                checked={isActive}
                                onCheckedChange={(checked) =>
                                    setValue("is_active", checked)
                                }
                            />
                            <Label htmlFor="is_active">Active</Label>
                        </div>

                        <div className="flex items-center gap-3">
                            <Switch
                                id="is_default"
                                checked={isDefault}
                                onCheckedChange={(checked) =>
                                    setValue("is_default", checked)
                                }
                            />
                            <Label htmlFor="is_default">Set as Default</Label>
                        </div>
                    </div>
                </form>

                <div className="border-t pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium">Questions</h4>
                        <Dialog
                            open={addDialogOpen}
                            onOpenChange={setAddDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Plus className="size-4" />
                                    Add Question
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Question</DialogTitle>
                                    <DialogDescription>
                                        Add a new question to this template
                                    </DialogDescription>
                                </DialogHeader>
                                <QuestionForm onSubmit={handleAddQuestion} />
                            </DialogContent>
                        </Dialog>
                    </div>

                    {!template.questions || template.questions.length === 0 ? (
                        <div className="flex items-center justify-center h-32 border border-dashed rounded-lg">
                            <span className="text-muted-foreground">
                                No questions added. Click "Add Question" to add
                                questions.
                            </span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {template.questions.map((q, index) => (
                                <div
                                    key={q.id}
                                    className="flex items-start gap-3 p-4 border rounded-lg"
                                >
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-6"
                                            disabled={index === 0}
                                            onClick={() =>
                                                handleMoveQuestion(index, "up")
                                            }
                                        >
                                            <ArrowUp className="size-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-6"
                                            disabled={
                                                index ===
                                                template.questions!.length - 1
                                            }
                                            onClick={() =>
                                                handleMoveQuestion(
                                                    index,
                                                    "down",
                                                )
                                            }
                                        >
                                            <ArrowDown className="size-3" />
                                        </Button>
                                    </div>
                                    <span className="text-sm text-muted-foreground w-6">
                                        {index + 1}.
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {q.question_text}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {getQuestionTypeLabel(
                                                q.question_type,
                                            )}
                                            {q.is_required && " • Required"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setQuestionToEdit(q);
                                                setEditDialogOpen(true);
                                            }}
                                        >
                                            <Edit className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setQuestionToEdit(q);
                                                setDeleteDialogOpen(true);
                                            }}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Question</DialogTitle>
                        <DialogDescription>
                            Edit this question
                        </DialogDescription>
                    </DialogHeader>
                    {questionToEdit && (
                        <QuestionForm
                            onSubmit={handleEditQuestion}
                            initialData={{
                                question_text: questionToEdit.question_text,
                                question_type: questionToEdit.question_type,
                                is_required: questionToEdit.is_required,
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <DeleteConfirmationDialog
                title="Delete Question"
                description={`Are you sure you want to delete "${questionToEdit?.question_text ?? ""}"?`}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteQuestion}
                isLoading={deleteQuestionMutation.isPending}
            />
        </main>
    );
}

function QuestionForm({
    onSubmit,
    initialData,
}: {
    onSubmit: (data: QuestionFormData) => void;
    initialData?: QuestionFormData;
}) {
    const [questionType, setQuestionType] = React.useState<
        QuestionFormData["question_type"]
    >(initialData?.question_type || "star_rating");
    const [isRequired, setIsRequired] = React.useState(
        initialData?.is_required ?? true,
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<{ question_text: string }>({
        defaultValues: {
            question_text: initialData?.question_text || "",
        },
    });

    const onFormSubmit = (data: { question_text: string }) => {
        onSubmit({
            question_text: data.question_text,
            question_type: questionType,
            is_required: isRequired,
        });
        if (!initialData) {
            reset();
        }
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="question_text">Question Text *</Label>
                <Input
                    id="question_text"
                    {...register("question_text", {
                        required: "Question text is required",
                    })}
                    aria-invalid={!!errors.question_text}
                />
                {errors.question_text && (
                    <span className="text-sm text-destructive">
                        {errors.question_text.message}
                    </span>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="question_type">Question Type</Label>
                <Select
                    value={questionType}
                    onValueChange={(val) =>
                        setQuestionType(
                            val as QuestionFormData["question_type"],
                        )
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="star_rating">
                            Star Rating (1-5)
                        </SelectItem>
                        <SelectItem value="text">Text Area</SelectItem>
                        <SelectItem value="yes_no">Yes/No</SelectItem>
                        <SelectItem value="yes_no_reason">
                            Yes/No with Reason
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="is_required"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="w-4 h-4"
                />
                <Label htmlFor="is_required">Required</Label>
            </div>

            <DialogFooter>
                <Button type="submit">
                    {initialData ? "Update" : "Add"} Question
                </Button>
            </DialogFooter>
        </form>
    );
}
