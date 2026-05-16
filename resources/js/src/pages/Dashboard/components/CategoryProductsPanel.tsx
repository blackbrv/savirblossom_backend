import React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ShoppingBag } from "lucide-react";
import { priceFormatter } from "@/utils/utility";

interface TopProduct {
    name: string;
    quantity: number;
}

interface CategorySales {
    category_name: string;
    color: string | null;
    total_quantity: number;
    total_revenue: number;
    top_products: TopProduct[];
}

interface CategoryProductsPanelProps {
    category: CategorySales | null;
    isOpen: boolean;
    onClose: () => void;
}

export function CategoryProductsPanel({
    category,
    isOpen,
    onClose,
}: CategoryProductsPanelProps) {
    const categoryColor = category?.color ?? undefined;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-[400px]">
                {categoryColor && (
                    <div
                        className="h-1 w-full"
                        style={{ backgroundColor: categoryColor }}
                    />
                )}
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        {category?.category_name}
                    </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6 p-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-muted p-4">
                            <p className="text-sm text-muted-foreground">
                                Total Sold
                            </p>
                            <p className="text-2xl font-bold">
                                {category?.total_quantity.toLocaleString() ?? 0}
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted p-4">
                            <p className="text-sm text-muted-foreground">
                                Total Revenue
                            </p>
                            <p className="text-2xl font-bold">
                                {priceFormatter(category?.total_revenue ?? 0)}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">
                            Top 5 Best Selling Products
                        </h3>
                        <div className="space-y-2">
                            {category?.top_products.map((product, index) => (
                                <div
                                    key={product.name}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                                            style={{
                                                backgroundColor:
                                                    categoryColor ??
                                                    `hsl(${index * 60}, 70%, 50%)`,
                                            }}
                                        >
                                            {index + 1}
                                        </div>
                                        <span className="font-medium">
                                            {product.name}
                                        </span>
                                    </div>
                                    <span className="text-muted-foreground">
                                        {product.quantity} sold
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
