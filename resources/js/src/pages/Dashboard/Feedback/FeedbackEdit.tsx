import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    useFeedbackResponse,
    useUpdateFeedback,
    FeedbackResponseType,
} from "@/services/Feedback/FeedbackApi";

type AnswerFormData = {
    rating_value?: number;
    text_value?: string;
    boolean_value?: boolean;
    reason_value?: string;
};

export default function FeedbackEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const feedbackId = Number(id);

    const { data, isLoading } = useFeedbackResponse(feedbackId);
    const updateMutation = useUpdateFeedback();

    const feedback = data?.data;

    const [answers, setAnswers] = React.useState<Map<number, AnswerFormData>>(
        new Map(),
    );

    React.useEffect(() => {
        if (feedback?.answers) {
            const answerMap = new Map<number, AnswerFormData>();
            feedback.answers.forEach((answer) => {
                answerMap.set(answer.id, {
                    rating_value: answer.rating_value ?? undefined,
                    text_value: answer.text_value ?? undefined,
                    boolean_value: answer.boolean_value ?? undefined,
                    reason_value: answer.reason_value ?? undefined,
                });
            });
            setAnswers(answerMap);
        }
    }, [feedback]);

    const handleAnswerChange = (
        answerId: number,
        field: keyof AnswerFormData,
        value: unknown,
    ) => {
        setAnswers((prev) => {
            const next = new Map(prev);
            const current = next.get(answerId) || {};
            next.set(answerId, { ...current, [field]: value });
            return next;
        });
    };

    const handleSubmit = async () => {
        if (!feedback) return;

        const answersData = feedback.answers
            .map((answer) => {
                const formData = answers.get(answer.id);
                if (!formData) return null;

                return {
                    id: answer.id,
                    rating_value: formData.rating_value,
                    text_value: formData.text_value || undefined,
                    boolean_value: formData.boolean_value,
                    reason_value: formData.reason_value || undefined,
                };
            })
            .filter(Boolean);

        try {
            await updateMutation.mutateAsync({
                id: feedbackId,
                data: { answers: answersData as never[] },
            });
            toast.success("Feedback updated successfully", {
                position: "top-center",
            });
            navigate(`/dashboard/feedback/${feedbackId}`);
        } catch (error) {
            console.error(error);
        }
    };

    const renderAnswerField = (answer: FeedbackResponseType["answers"][0]) => {
        const questionType = answer.question?.question_type;
        const formData = answers.get(answer.id) || {};

        if (questionType === "star_rating") {
            return (
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() =>
                                handleAnswerChange(
                                    answer.id,
                                    "rating_value",
                                    star,
                                )
                            }
                            className="text-2xl focus:outline-none"
                        >
                            <span
                                className={
                                    star <= (formData.rating_value || 0)
                                        ? "text-yellow-500"
                                        : "text-gray-300"
                                }
                            >
                                ★
                            </span>
                        </button>
                    ))}
                    {formData.rating_value && (
                        <span className="ml-2 text-sm text-muted-foreground">
                            ({formData.rating_value}/5)
                        </span>
                    )}
                </div>
            );
        }

        if (questionType === "text") {
            return (
                <Textarea
                    value={formData.text_value || ""}
                    onChange={(e) =>
                        handleAnswerChange(
                            answer.id,
                            "text_value",
                            e.target.value,
                        )
                    }
                    placeholder="Enter your answer..."
                    rows={3}
                />
            );
        }

        if (questionType === "yes_no") {
            return (
                <div className="flex items-center gap-3">
                    <Switch
                        checked={formData.boolean_value || false}
                        onCheckedChange={(checked) =>
                            handleAnswerChange(
                                answer.id,
                                "boolean_value",
                                checked,
                            )
                        }
                    />
                    <Label>{formData.boolean_value ? "Yes" : "No"}</Label>
                </div>
            );
        }

        if (questionType === "yes_no_reason") {
            return (
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Switch
                            checked={formData.boolean_value || false}
                            onCheckedChange={(checked) =>
                                handleAnswerChange(
                                    answer.id,
                                    "boolean_value",
                                    checked,
                                )
                            }
                        />
                        <Label>{formData.boolean_value ? "Yes" : "No"}</Label>
                    </div>
                    {formData.boolean_value && (
                        <Textarea
                            value={formData.reason_value || ""}
                            onChange={(e) =>
                                handleAnswerChange(
                                    answer.id,
                                    "reason_value",
                                    e.target.value,
                                )
                            }
                            placeholder="Please provide a reason..."
                            rows={2}
                        />
                    )}
                </div>
            );
        }

        return null;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">Loading...</span>
            </div>
        );
    }

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
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Edit Feedback
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg overflow-auto">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            navigate(`/dashboard/feedback/${feedbackId}`)
                        }
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Details
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending
                            ? "Saving..."
                            : "Save Changes"}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                        <span className="text-sm text-muted-foreground">
                            ID
                        </span>
                        <p className="font-medium">#{feedback.id}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Customer
                        </span>
                        <p className="font-medium">
                            {feedback.customer
                                ? `${feedback.customer.username} (${feedback.customer.email})`
                                : "Guest"}
                        </p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Order
                        </span>
                        <p className="font-medium">
                            {feedback.order ? `#${feedback.order.id}` : "-"}
                        </p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Bouquet
                        </span>
                        <p className="font-medium">
                            {feedback.bouquet?.name || "-"}
                        </p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Date
                        </span>
                        <p className="font-medium">
                            {new Date(feedback.created_at).toLocaleDateString(
                                "en-US",
                                {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                },
                            )}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-lg font-medium">Answers</h4>
                    {feedback.answers.length === 0 ? (
                        <div className="flex items-center justify-center h-32 border border-dashed rounded-lg">
                            <span className="text-muted-foreground">
                                No answers to edit
                            </span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {feedback.answers.map((answer) => (
                                <div
                                    key={answer.id}
                                    className="space-y-2 p-4 border rounded-lg"
                                >
                                    <Label className="text-base font-medium">
                                        {answer.question?.question_text ||
                                            "Question"}
                                        {answer.question?.is_required && (
                                            <span className="text-destructive ml-1">
                                                *
                                            </span>
                                        )}
                                    </Label>
                                    {renderAnswerField(answer)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
