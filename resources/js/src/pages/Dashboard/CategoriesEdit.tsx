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
    useBouquetCategories,
    useUpdateCategory,
} from "@/services/Bouquets/BouquetsApi";
import { useParams } from "react-router";

type CategoryFormData = {
    name: string;
    description: string;
    published: boolean;
};

export default function CategoriesEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: categoriesData } = useBouquetCategories({
        unfilterred: true,
    });
    const categories = categoriesData?.data ?? [];
    const category = categories.find((c) => c.id === Number(id));

    const updateCategoryMutation = useUpdateCategory();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CategoryFormData>({
        defaultValues: {
            name: "",
            description: "",
            published: false,
        },
    });

    const published = watch("published");

    React.useEffect(() => {
        if (category) {
            reset({
                name: category.name,
                description: category.description ?? "",
                published:
                    category.published === 1 || category.published === true,
            });
        }
    }, [category, reset]);

    const onSubmit = async (formData: CategoryFormData) => {
        try {
            await updateCategoryMutation.mutateAsync({
                id: Number(id),
                data: {
                    name: formData.name,
                    description: formData.description || undefined,
                    published: formData.published,
                },
            });

            toast.success("Category updated successfully", {
                position: "top-center",
            });

            navigate("/dashboard/categories");
        } catch (error) {
            toast.error("Failed to update category", {
                position: "top-center",
            });
            console.error(error);
        }
    };

    if (!category) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">Loading...</span>
            </div>
        );
    }

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Edit Category: {category.name}
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
                        Save Changes
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

                    <div className="flex items-center gap-3">
                        <Switch
                            id="published"
                            checked={published}
                            onCheckedChange={(checked) =>
                                setValue("published", checked)
                            }
                        />
                        <Label htmlFor="published">Published</Label>
                    </div>
                </form>
            </section>
        </main>
    );
}
