import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
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
import { useCreateForm, useAddFormQuestion } from "@/services/Forms/FormsApi";

type TemplateFormData = {
    name: string;
    description: string;
    is_active: boolean;
};

type OptionData = {
    label: string;
    value: string;
};

type QuestionFormData = {
    label: string;
    question_type: string;
    is_required: boolean;
    config: Record<string, unknown>;
    options: OptionData[];
};

const QUESTION_TYPES = [
    { value: "text", label: "Text Input" },
    { value: "textarea", label: "Text Area" },
    { value: "number", label: "Number" },
    { value: "boolean", label: "Yes / No" },
    { value: "select", label: "Select (Dropdown)" },
    { value: "radio", label: "Radio Buttons" },
    { value: "checkbox", label: "Checkboxes" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "date", label: "Date" },
];

const TYPES_WITH_OPTIONS = ["select", "radio", "checkbox"];

export default function FormCreate() {
    const navigate = useNavigate();
    const [questions, setQuestions] = React.useState<QuestionFormData[]>([]);
    const [dialogOpen, setDialogOpen] = React.useState(false);

    const createFormMutation = useCreateForm();
    const addQuestionMutation = useAddFormQuestion();

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
            is_active: true,
        },
    });

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
            const response = await createFormMutation.mutateAsync({
                name: formData.name,
                description: formData.description || undefined,
                is_active: formData.is_active,
            });

            const formId = response.data.id;

            for (const question of questions) {
                await addQuestionMutation.mutateAsync({
                    formId,
                    data: {
                        label: question.label,
                        question_type: question.question_type,
                        is_required: question.is_required,
                        config:
                            Object.keys(question.config ?? {}).length > 0
                                ? question.config
                                : undefined,
                        options:
                            question.options.length > 0
                                ? question.options
                                : undefined,
                    },
                });
            }

            toast.success("Form created successfully", {
                position: "top-center",
            });

            navigate("/dashboard/form-builder");
        } catch (error) {
            console.error(error);
        }
    };

    const getQuestionTypeLabel = (type: string) => {
        const found = QUESTION_TYPES.find((t) => t.value === type);
        return found?.label ?? type;
    };

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Create Form
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
                        type="submit"
                        form="form-form"
                        disabled={isSubmitting}
                    >
                        Create Form
                    </Button>
                </div>

                <form
                    id="form-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <Label htmlFor="name">Form Name *</Label>
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
                            <DialogContent className="max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Add Question</DialogTitle>
                                    <DialogDescription>
                                        Add a new question to this form
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
                                        <p className="font-medium">{q.label}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {getQuestionTypeLabel(
                                                q.question_type,
                                            )}
                                            {q.is_required && " • Required"}
                                            {q.options.length > 0 &&
                                                ` • ${q.options.length} option(s)`}
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
    const [questionType, setQuestionType] = React.useState("text");
    const [isRequired, setIsRequired] = React.useState(false);
    const [placeholder, setPlaceholder] = React.useState("");
    const [maxLength, setMaxLength] = React.useState("");
    const [rows, setRows] = React.useState("");
    const [options, setOptions] = React.useState<OptionData[]>([]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<{ label: string }>({
        defaultValues: {
            label: "",
        },
    });

    const hasOptions = TYPES_WITH_OPTIONS.includes(questionType);

    const addOption = () => {
        setOptions((prev) => [...prev, { label: "", value: "" }]);
    };

    const updateOption = (
        index: number,
        field: keyof OptionData,
        val: string,
    ) => {
        setOptions((prev) =>
            prev.map((opt, i) =>
                i === index ? { ...opt, [field]: val } : opt,
            ),
        );
    };

    const removeOption = (index: number) => {
        setOptions((prev) => prev.filter((_, i) => i !== index));
    };

    const buildConfig = (): Record<string, unknown> => {
        const config: Record<string, unknown> = {};
        if (
            questionType === "text" ||
            questionType === "email" ||
            questionType === "phone"
        ) {
            if (placeholder) config.placeholder = placeholder;
            if (maxLength) config.max_length = Number(maxLength);
        }
        if (questionType === "textarea") {
            if (placeholder) config.placeholder = placeholder;
            if (rows) config.rows = Number(rows);
            if (maxLength) config.max_length = Number(maxLength);
        }
        if (questionType === "boolean") {
            config.label_yes = "Yes";
            config.label_no = "No";
        }
        if (questionType === "number") {
            if (placeholder) config.placeholder = placeholder;
        }
        if (questionType === "select") {
            config.placeholder = placeholder || "Select an option";
        }
        return config;
    };

    const onFormSubmit = (data: { label: string }) => {
        onSubmit({
            label: data.label,
            question_type: questionType,
            is_required: isRequired,
            config: buildConfig(),
            options: options.filter((o) => o.label.trim() !== ""),
        });
        reset();
        setQuestionType("text");
        setIsRequired(false);
        setPlaceholder("");
        setMaxLength("");
        setRows("");
        setOptions([]);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="question_label">Question Label *</Label>
                <Input
                    id="question_label"
                    {...register("label", {
                        required: "Question label is required",
                    })}
                    aria-invalid={!!errors.label}
                />
                {errors.label && (
                    <span className="text-sm text-destructive">
                        {errors.label.message}
                    </span>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="question_type">Answer Type</Label>
                <Select
                    value={questionType}
                    onValueChange={(val) => {
                        setQuestionType(val);
                        setOptions([]);
                    }}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {QUESTION_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                                {t.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {!hasOptions && (
                <div className="space-y-2">
                    <Label htmlFor="placeholder">Placeholder</Label>
                    <Input
                        id="placeholder"
                        value={placeholder}
                        onChange={(e) => setPlaceholder(e.target.value)}
                    />
                </div>
            )}

            {questionType === "text" && (
                <div className="space-y-2">
                    <Label htmlFor="max_length">Max Length</Label>
                    <Input
                        id="max_length"
                        type="number"
                        value={maxLength}
                        onChange={(e) => setMaxLength(e.target.value)}
                    />
                </div>
            )}

            {questionType === "textarea" && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="rows">Rows</Label>
                        <Input
                            id="rows"
                            type="number"
                            value={rows}
                            onChange={(e) => setRows(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ta_max_length">Max Length</Label>
                        <Input
                            id="ta_max_length"
                            type="number"
                            value={maxLength}
                            onChange={(e) => setMaxLength(e.target.value)}
                        />
                    </div>
                </>
            )}

            {hasOptions && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Answer Options</Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addOption}
                        >
                            <Plus className="size-3 mr-1" />
                            Add Option
                        </Button>
                    </div>
                    {options.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No options yet. Click "Add Option" to add choices.
                        </p>
                    )}
                    {options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-6">
                                {idx + 1}.
                            </span>
                            <Input
                                placeholder="Option label"
                                value={opt.label}
                                onChange={(e) =>
                                    updateOption(idx, "label", e.target.value)
                                }
                                className="flex-1"
                            />
                            <Input
                                placeholder="Value (optional)"
                                value={opt.value}
                                onChange={(e) =>
                                    updateOption(idx, "value", e.target.value)
                                }
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(idx)}
                                className="text-destructive shrink-0"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

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
