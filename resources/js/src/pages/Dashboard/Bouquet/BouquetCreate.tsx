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
    useBouquetCategories,
    useCreateBouquet,
    GalleriesType,
} from "@/services/Bouquets/BouquetsApi";

type BouquetFormData = {
    name: string;
    description: string;
    price: string;
    stock: number;
    category_id: number;
    published: boolean;
};

type GalleryFormData = {
    src: string;
    alt_text: string;
};

export default function BouquetCreate() {
    const navigate = useNavigate();
    const { data: categories } = useBouquetCategories();
    const createBouquetMutation = useCreateBouquet();

    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingImage, setEditingImage] =
        React.useState<GalleriesType | null>(null);
    const [galleries, setGalleries] = React.useState<GalleriesType[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
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
        },
    });

    const published = watch("published");

    const handleOpenAddDialog = () => {
        setEditingImage(null);
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (image: GalleriesType) => {
        setEditingImage(image);
        setIsDialogOpen(true);
    };

    const handleSaveImage = (formData: GalleryFormData) => {
        if (editingImage) {
            setGalleries((prev) =>
                prev.map((img) =>
                    img.id === editingImage.id ? { ...img, ...formData } : img,
                ),
            );
        } else {
            const newImage: GalleriesType = {
                id: -Date.now(),
                src: formData.src,
                alt_text: formData.alt_text,
            };
            setGalleries((prev) => [...prev, newImage]);
        }
        setIsDialogOpen(false);
        setEditingImage(null);
    };

    const handleDeleteImage = (image: GalleriesType) => {
        setGalleries((prev) => prev.filter((img) => img.id !== image.id));
    };

    const onSubmit = async (formData: BouquetFormData) => {
        try {
            const response = await createBouquetMutation.mutateAsync({
                name: formData.name,
                description: formData.description || "",
                price: formData.price,
                stock: formData.stock,
                category_id: formData.category_id,
                published: formData.published,
                galleries: galleries.map((g) => ({
                    src: g.src!,
                    alt_text: g.alt_text,
                })),
            });

            toast.success("Bouquet created successfully", {
                position: "top-center",
            });

            navigate(`/dashboard/bouquet/${response.data.id}`);
        } catch (error) {
            toast.error("Failed to create bouquet", {
                position: "top-center",
            });
            console.error(error);
        }
    };

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
                Create Bouquet
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/bouquet")}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Bouquets
                    </Button>
                    <Button
                        type="submit"
                        form="bouquet-form"
                        disabled={isSubmitting}
                    >
                        Create Bouquet
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
                                    Images ({galleries.length})
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

                            {galleries.length > 0 ? (
                                <div className="space-y-3">
                                    {galleries.map((gallery) => (
                                        <div
                                            key={gallery.id}
                                            className="flex items-center gap-4 p-3 border rounded-lg border-dashed"
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
