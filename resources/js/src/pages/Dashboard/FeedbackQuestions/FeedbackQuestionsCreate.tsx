import React from "react";
import { useNavigate } from "react-router-dom";
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
import { Plus, Trash2 } from "lucide-react";
import {
    useCreateFeedbackTemplate,
    useAddFeedbackQuestion,
} from "@/services/Feedback/FeedbackQuestionsApi";

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

export default function FeedbackQuestionsCreate() {
    const navigate = useNavigate();
    const [questions, setQuestions] = React.useState<QuestionFormData[]>([]);
    const [dialogOpen, setDialogOpen] = React.useState(false);

    const createTemplateMutation = useCreateFeedbackTemplate();
    const addQuestionMutation = useAddFeedbackQuestion();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
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

    const addQuestion = (data: QuestionFormData) => {
        setQuestions((prev) => [...prev, data]);
        setDialogOpen(false);
    };

    const removeQuestion = (index: number) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (formData: TemplateFormData) => {
        try {
            const response = await createTemplateMutation.mutateAsync({
                name: formData.name,
                description: formData.description || undefined,
                is_default: formData.is_default,
                is_active: formData.is_active,
            });

            const templateId = response.data.id;

            for (const question of questions) {
                await addQuestionMutation.mutateAsync({
                    templateId,
                    data: {
                        question_text: question.question_text,
                        question_type: question.question_type,
                        is_required: question.is_required,
                    },
                });
            }

            toast.success("Template created successfully", {
                position: "top-center",
            });

            navigate("/dashboard/feedback/questions");
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

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Create Feedback Template
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
                        Create Template
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
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                                <AddQuestionForm onSubmit={addQuestion} />
                            </DialogContent>
                        </Dialog>
                    </div>

                    {questions.length === 0 ? (
                        <div className="flex items-center justify-center h-32 border border-dashed rounded-lg">
                            <span className="text-muted-foreground">
                                No questions added. Click "Add Question" to add
                                questions.
                            </span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {questions.map((q, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-4 border rounded-lg"
                                >
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
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeQuestion(index)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

function AddQuestionForm({
    onSubmit,
}: {
    onSubmit: (data: QuestionFormData) => void;
}) {
    const [questionType, setQuestionType] =
        React.useState<QuestionFormData["question_type"]>("star_rating");
    const [isRequired, setIsRequired] = React.useState(true);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<{ question_text: string }>({
        defaultValues: {
            question_text: "",
        },
    });

    const onFormSubmit = (data: { question_text: string }) => {
        onSubmit({
            question_text: data.question_text,
            question_type: questionType,
            is_required: isRequired,
        });
        reset();
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
                <Button type="submit">Add Question</Button>
            </DialogFooter>
        </form>
    );
}
