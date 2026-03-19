import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GetBouquetsResponse } from "@/services/Bouquets/BouquetsApi";
import { priceFormatter } from "@/utils/utility";

type BouquetDetailViewProps = {
    data?: GetBouquetsResponse;
    isLoading?: boolean;
};

export default function BouquetDetailView({
    data,
    isLoading,
}: BouquetDetailViewProps) {
    const navigate = useNavigate();

    const handleEdit = React.useCallback(() => {
        navigate(`/dashboard/bouquet/${data?.id}/edit`);
    }, [navigate, data?.id]);

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

    const isPublished = data.published === 1 || data.published === true;

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Bouquet Details
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
                        Back to List
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEdit}
                        className="gap-2"
                    >
                        <Pencil className="size-4" />
                        Edit
                    </Button>
                </div>

                <Tabs defaultValue="details" className="h-full flex flex-col">
                    <TabsList className="w-fit p-1">
                        <TabsTrigger value="details" className="px-4 py-2">
                            Details
                        </TabsTrigger>
                        <TabsTrigger value="galleries" className="px-4 py-2">
                            Galleries
                        </TabsTrigger>
                        <TabsTrigger value="inventory" className="px-4 py-2">
                            Inventory
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="details"
                        className="flex-1 p-6 space-y-6"
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Name
                                </span>
                                <p className="text-lg font-medium">
                                    {data.name}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Description
                                </span>
                                <p className="text-base">
                                    {data.description ||
                                        "No description provided."}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Category
                                </span>
                                <div>
                                    <Badge variant="outline">
                                        {data.category?.name ?? "Uncategorized"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Published
                                </span>
                                <div>
                                    <Badge
                                        variant={
                                            isPublished
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {isPublished ? "true" : "false"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="galleries" className="flex-1 p-6">
                        {data.galleries && data.galleries.length > 0 ? (
                            <div className="space-y-4">
                                <span className="text-sm text-muted-foreground">
                                    Images ({data.galleries.length})
                                </span>
                                <div className="space-y-3">
                                    {data.galleries.map((gallery, index) => (
                                        <div
                                            key={gallery.id ?? index}
                                            className="flex items-center gap-4 p-3 border rounded-lg"
                                        >
                                            <img
                                                src={gallery.src}
                                                alt={
                                                    gallery.alt_text ??
                                                    `Image ${index + 1}`
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
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-32">
                                <span className="text-muted-foreground">
                                    No images available
                                </span>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent
                        value="inventory"
                        className="flex-1 p-6 space-y-6"
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Stock
                                </span>
                                <p className="text-xl font-semibold">
                                    {data.stock} units
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Price
                                </span>
                                <p className="text-xl font-semibold">
                                    {priceFormatter(parseFloat(data.price))}
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </section>
        </main>
    );
}
