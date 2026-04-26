import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
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
    useBouquets,
    useRemoveBouquetFromCategory,
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

    const categoryId = Number(id);
    const { data: bouquetsData, isLoading: bouquetsLoading } = useBouquets({
        categoryId,
        perPage: 100,
    });
    const relatedBouquets = bouquetsData?.data ?? [];

    const removeBouquetMutation = useRemoveBouquetFromCategory();

    const handleRemoveBouquet = async (bouquetId: number) => {
        try {
            await removeBouquetMutation.mutateAsync({ id: bouquetId });
            toast.success("Bouquet removed from category", {
                position: "top-center",
            });
        } catch (error) {
            toast.error("Failed to remove bouquet from category", {
                position: "top-center",
            });
            console.error(error);
        }
    };

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
        <main className="min-h-screen flex flex-col gap-8 justify-center p-6">
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

            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium">Related Bouquets</h4>
                    <span className="text-sm text-muted-foreground">
                        {relatedBouquets.length} bouquet
                        {relatedBouquets.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {bouquetsLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <span className="text-muted-foreground">
                            Loading...
                        </span>
                    </div>
                ) : relatedBouquets.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                        <span className="text-muted-foreground">
                            No bouquets in this category
                        </span>
                    </div>
                ) : (
                    <div className="border border-border rounded-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                                        Name
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                                        Price
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                                        Stock
                                    </th>
                                    <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {relatedBouquets.map((bouquet) => (
                                    <tr
                                        key={bouquet.id}
                                        className="hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3">
                                            {bouquet.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            {new Intl.NumberFormat("en-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                            }).format(parseInt(bouquet.price))}
                                        </td>
                                        <td className="px-4 py-3">
                                            {bouquet.stock}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleRemoveBouquet(
                                                        bouquet.id,
                                                    )
                                                }
                                                disabled={
                                                    removeBouquetMutation.isPending
                                                }
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="size-4" />
                                                Remove
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}
