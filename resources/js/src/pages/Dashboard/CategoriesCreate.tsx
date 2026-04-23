import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCategory } from "@/services/Bouquets/BouquetsApi";

type CategoryFormData = {
    name: string;
    description: string;
};

export default function CategoriesCreate() {
    const navigate = useNavigate();
    const createCategoryMutation = useCreateCategory();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CategoryFormData>({
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const onSubmit = async (formData: CategoryFormData) => {
        try {
            await createCategoryMutation.mutateAsync({
                name: formData.name,
                description: formData.description || undefined,
            });

            toast.success("Category created successfully", {
                position: "top-center",
            });

            navigate("/dashboard/categories");
        } catch (error) {
            toast.error("Failed to create category", {
                position: "top-center",
            });
            console.error(error);
        }
    };

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Create Category
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/categories")}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Categories
                    </Button>
                    <Button
                        type="submit"
                        form="category-form"
                        disabled={isSubmitting}
                    >
                        Create Category
                    </Button>
                </div>

                <form
                    id="category-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
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
                            rows={4}
                            {...register("description")}
                        />
                    </div>
                </form>
            </section>
        </main>
    );
}
