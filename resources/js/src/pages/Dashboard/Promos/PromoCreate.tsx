import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreatePromo } from "@/services/Promos/PromosApi";

type PromoFormData = {
    title: string;
    description: string;
    status: "draft" | "scheduled" | "published" | "archived";
    scheduled_at: string;
    cta_label: string;
    cta_url: string;
};

export default function PromoCreate() {
    const navigate = useNavigate();
    const createPromoMutation = useCreatePromo();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<PromoFormData>({
        defaultValues: {
            title: "",
            description: "",
            status: "draft",
            scheduled_at: "",
            cta_label: "",
            cta_url: "",
        },
    });

    const status = watch("status");

    const onSubmit = async (data: PromoFormData) => {
        try {
            const response = await createPromoMutation.mutateAsync({
                title: data.title,
                description: data.description || undefined,
                status: data.status,
                scheduled_at: data.scheduled_at || undefined,
                cta_label: data.cta_label || undefined,
                cta_url: data.cta_url || undefined,
            });
            toast.success("Promo created successfully");
            navigate(`/dashboard/promos/${response.data.id}`);
        } catch {
            toast.error("Failed to create promo");
        }
    };

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Create New Promo
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg overflow-auto">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/promos")}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Promos
                    </Button>
                    <Button
                        type="submit"
                        form="promo-form"
                        disabled={isSubmitting}
                    >
                        Create Promo
                    </Button>
                </div>

                <form id="promo-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                {...register("title", {
                                    required: "Title is required",
                                })}
                                placeholder="e.g., Valentine Bouquet Promo"
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500">
                                    {errors.title.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={status}
                                onValueChange={(val) =>
                                    setValue(
                                        "status",
                                        val as PromoFormData["status"],
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="scheduled">
                                        Scheduled
                                    </SelectItem>
                                    <SelectItem value="published">
                                        Published
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                placeholder="Describe the promo..."
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="scheduled_at">
                                Schedule Date
                            </Label>
                            <Input
                                id="scheduled_at"
                                type="datetime-local"
                                {...register("scheduled_at")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cta_label">CTA Label</Label>
                            <Input
                                id="cta_label"
                                {...register("cta_label")}
                                placeholder="e.g., Shop Now"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="cta_url">CTA URL</Label>
                            <Input
                                id="cta_url"
                                {...register("cta_url")}
                                placeholder="e.g., https://savirblossom.com/shop"
                            />
                        </div>
                    </div>
                </form>
            </section>
        </main>
    );
}
