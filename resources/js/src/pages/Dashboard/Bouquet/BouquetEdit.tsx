import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
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
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    useBouquetDetails,
    useBouquetCategories,
    useUpdateBouquet,
    useCreateGallery,
    useUpdateGallery,
    useDeleteGallery,
    GalleriesType,
} from "@/services/Bouquets/BouquetsApi";
import {
    useFeedbackTemplates,
    FeedbackQuestionsTemplateType,
} from "@/services/Feedback/FeedbackQuestionsApi";
import { useParams } from "react-router";

type BouquetFormData = {
    name: string;
    description: string;
    price: string;
    stock: number;
    category_id: number;
    published: boolean;
    feedback_questions_template_id: number | null;
};

type GalleryFormData = {
    src: string;
    alt_text: string;
};

export default function BouquetEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading } = useBouquetDetails({ id: Number(id) });
    const { data: categories } = useBouquetCategories();
    const { data: feedbackTemplatesData } = useFeedbackTemplates({
        perPage: 100,
    });

    const feedbackTemplates = feedbackTemplatesData?.data ?? [];

    const updateBouquetMutation = useUpdateBouquet();
    const createGalleryMutation = useCreateGallery();
    const updateGalleryMutation = useUpdateGallery();
    const deleteGalleryMutation = useDeleteGallery();

    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingImage, setEditingImage] =
        React.useState<GalleriesType | null>(null);
    const [isEditingOriginal, setIsEditingOriginal] = React.useState(false);
    const [originalGalleries, setOriginalGalleries] = React.useState<
        GalleriesType[]
    >([]);
    const [newGalleries, setNewGalleries] = React.useState<GalleriesType[]>([]);
    const [deletedGalleryIds, setDeletedGalleryIds] = React.useState<number[]>(
        [],
    );

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<BouquetFormData>({
        defaultValues: {
            name: "",
            description: "",
            price: "",
            stock: 0,
            category_id: 0,
            published: false,
            feedback_questions_template_id: null,
        },
    });

    const published = watch("published");

    React.useEffect(() => {
        if (data) {
            reset({
                name: data.name,
                description: data.description ?? "",
                price: data.price,
                stock: data.stock,
                category_id: data.category.id,
                published: data.published === 1 || data.published === true,
                feedback_questions_template_id:
                    data.feedback_questions_template_id ?? null,
            });
            setOriginalGalleries(data.galleries ?? []);
            setNewGalleries([]);
            setDeletedGalleryIds([]);
        }
    }, [data, reset]);

    const handleOpenAddDialog = () => {
        setEditingImage(null);
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (
        image: GalleriesType,
        isNew: boolean = false,
    ) => {
        setEditingImage(image);
        setIsEditingOriginal(!isNew);
        setIsDialogOpen(true);
    };

    const handleSaveImage = (formData: GalleryFormData) => {
        if (editingImage) {
            if (isEditingOriginal) {
                setOriginalGalleries((prev) =>
                    prev.map((img) =>
                        img.id === editingImage.id
                            ? { ...img, ...formData }
                            : img,
                    ),
                );
            } else {
                setNewGalleries((prev) =>
                    prev.map((img) =>
                        img.id === editingImage.id
                            ? { ...img, ...formData }
                            : img,
                    ),
                );
            }
        } else {
            const newImage: GalleriesType = {
                id: -Date.now(),
                src: formData.src,
                alt_text: formData.alt_text,
            };
            setNewGalleries((prev) => [...prev, newImage]);
        }
        setIsDialogOpen(false);
        setEditingImage(null);
    };

    const handleDeleteImage = (image: GalleriesType) => {
        if (image.id < 0) {
            setNewGalleries((prev) =>
                prev.filter((img) => img.id !== image.id),
            );
        } else {
            setDeletedGalleryIds((prev) => [...prev, image.id]);
            setOriginalGalleries((prev) =>
                prev.filter((img) => img.id !== image.id),
            );
        }
    };

    const onSubmit = async (formData: BouquetFormData) => {
        try {
            const bouquetId = Number(id);

            await Promise.all([
                ...deletedGalleryIds.map((galleryId) =>
                    deleteGalleryMutation.mutateAsync({ bouquetId, galleryId }),
                ),
                ...newGalleries.map((img) =>
                    createGalleryMutation.mutateAsync({
                        bouquetId,
                        data: { src: img.src!, alt_text: img.alt_text },
                    }),
                ),
                ...originalGalleries.map((img) =>
                    updateGalleryMutation.mutateAsync({
                        bouquetId,
                        galleryId: img.id,
                        data: { src: img.src!, alt_text: img.alt_text },
                    }),
                ),
                updateBouquetMutation.mutateAsync({
                    id: bouquetId,
                    data: formData,
                }),
            ]);

            toast.success("Bouquet updated successfully", {
                position: "top-center",
            });

            navigate(`/dashboard/bouquet/${id}`);
        } catch (error) {
            toast.error("Failed to update bouquet", {
                position: "top-center",
            });
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">Loading...</span>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">Bouquet not found</span>
            </div>
        );
    }

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild></DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingImage ? "Edit Image" : "Add Image"}
                        </DialogTitle>
                        <DialogDescription>
                            Enter the image URL and alt text for the gallery.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleSaveImage({
                                src: formData.get("src") as string,
                                alt_text: formData.get("alt_text") as string,
                            });
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="gallery-src">Image URL</Label>
                            <Input
                                id="gallery-src"
                                name="src"
                                defaultValue={editingImage?.src}
                                placeholder="https://example.com/image.jpg"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gallery-alt">Alt Text</Label>
                            <Input
                                id="gallery-alt"
                                name="alt_text"
                                defaultValue={editingImage?.alt_text}
                                placeholder="Description of the image"
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingImage ? "Update" : "Add"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Edit Bouquet: {data.name}
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/dashboard/bouquet/${id}`)}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Preview
                    </Button>
                    <Button
                        type="submit"
                        form="bouquet-form"
                        disabled={isSubmitting}
                    >
                        Save Changes
                    </Button>
                </div>

                <form id="bouquet-form" onSubmit={handleSubmit(onSubmit)}>
                    <Tabs
                        defaultValue="details"
                        className="h-full flex flex-col"
                    >
                        <TabsList className="w-fit p-1">
                            <TabsTrigger value="details" className="px-4 py-2">
                                Details
                            </TabsTrigger>
                            <TabsTrigger
                                value="galleries"
                                className="px-4 py-2"
                            >
                                Galleries
                            </TabsTrigger>
                            <TabsTrigger
                                value="inventory"
                                className="px-4 py-2"
                            >
                                Inventory
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="details"
                            className="flex-1 p-6 space-y-6"
                        >
                            <div className="space-y-6">
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
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={
                                            watch("category_id")
                                                ? String(watch("category_id"))
                                                : undefined
                                        }
                                        onValueChange={(value) => {
                                            if (value)
                                                setValue(
                                                    "category_id",
                                                    Number(value),
                                                    {
                                                        shouldValidate: true,
                                                    },
                                                );
                                        }}
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories?.data?.map(
                                                (category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={String(
                                                            category.id,
                                                        )}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="feedback-template">
                                        Feedback Template
                                    </Label>
                                    <Select
                                        value={
                                            watch(
                                                "feedback_questions_template_id",
                                            )
                                                ? String(
                                                      watch(
                                                          "feedback_questions_template_id",
                                                      ),
                                                  )
                                                : "none"
                                        }
                                        onValueChange={(value) => {
                                            setValue(
                                                "feedback_questions_template_id",
                                                value === "none"
                                                    ? null
                                                    : Number(value),
                                                { shouldValidate: true },
                                            );
                                        }}
                                    >
                                        <SelectTrigger id="feedback-template">
                                            <SelectValue placeholder="Select feedback template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Use Default
                                            </SelectItem>
                                            {feedbackTemplates.map(
                                                (template) => (
                                                    <SelectItem
                                                        key={template.id}
                                                        value={String(
                                                            template.id,
                                                        )}
                                                    >
                                                        {template.name}
                                                        {template.is_default &&
                                                            " (Default)"}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
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
                        </TabsContent>

                        <TabsContent value="galleries" className="flex-1 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-muted-foreground">
                                    Images (
                                    {originalGalleries.length +
                                        newGalleries.length}
                                    )
                                </span>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleOpenAddDialog}
                                    className="gap-2"
                                >
                                    <Plus className="size-4" />
                                    Add Image
                                </Button>
                            </div>

                            {originalGalleries.length + newGalleries.length >
                            0 ? (
                                <div className="space-y-3">
                                    {originalGalleries.map((gallery) => (
                                        <div
                                            key={gallery.id}
                                            className="flex items-center gap-4 p-3 border rounded-lg"
                                        >
                                            <img
                                                src={gallery.src}
                                                alt={
                                                    gallery.alt_text ??
                                                    "Gallery image"
                                                }
                                                className="size-16 object-cover rounded-md"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {gallery.alt_text ??
                                                        "No alt text"}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {gallery.src}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleOpenEditDialog(
                                                            gallery,
                                                            false,
                                                        )
                                                    }
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDeleteImage(
                                                            gallery,
                                                        )
                                                    }
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {newGalleries.map((gallery) => (
                                        <div
                                            key={gallery.id}
                                            className="flex items-center gap-4 p-3 border rounded-lg border-dashed"
                                        >
                                            <img
                                                src={gallery.src}
                                                alt={
                                                    gallery.alt_text ??
                                                    "New gallery image"
                                                }
                                                className="size-16 object-cover rounded-md"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {gallery.alt_text ??
                                                        "No alt text"}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {gallery.src}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleOpenEditDialog(
                                                            gallery,
                                                            true,
                                                        )
                                                    }
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDeleteImage(
                                                            gallery,
                                                        )
                                                    }
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-32">
                                    <span className="text-muted-foreground">
                                        No images. Click "Add Image" to add one.
                                    </span>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent
                            value="inventory"
                            className="flex-1 p-6 space-y-6"
                        >
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        {...register("stock", {
                                            required: "Stock is required",
                                            valueAsNumber: true,
                                        })}
                                        aria-invalid={!!errors.stock}
                                    />
                                    {errors.stock && (
                                        <span className="text-sm text-destructive">
                                            {errors.stock.message}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        {...register("price", {
                                            required: "Price is required",
                                            valueAsNumber: false,
                                        })}
                                        aria-invalid={!!errors.price}
                                    />
                                    {errors.price && (
                                        <span className="text-sm text-destructive">
                                            {errors.price.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </form>
            </section>
        </main>
    );
}
