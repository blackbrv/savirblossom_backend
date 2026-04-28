import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CouponType } from "@/services/Coupons/CouponsApi";

type DiscountDetailViewProps = {
    data?: CouponType;
    isLoading?: boolean;
};

export default function DiscountDetailView({
    data,
    isLoading,
}: DiscountDetailViewProps) {
    const navigate = useNavigate();

    const handleEdit = React.useCallback(() => {
        navigate(`/dashboard/discount/${data?.id}/edit`);
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
                <span className="text-muted-foreground">Coupon not found</span>
            </div>
        );
    }

    const discountDisplay =
        data.discount_type === "percentage"
            ? `${data.discount_value}%`
            : `$${data.discount_value}`;

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Coupon Details
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/discount")}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Discounts
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
                        <TabsTrigger value="usage" className="px-4 py-2">
                            Usage
                        </TabsTrigger>
                        <TabsTrigger value="scope" className="px-4 py-2">
                            Scope
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="details"
                        className="flex-1 p-6 space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Code
                                </span>
                                <p className="text-lg font-medium">
                                    {data.code}
                                </p>
                            </div>

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
                                    Discount Type
                                </span>
                                <p className="text-lg font-medium capitalize">
                                    {data.discount_type === "percentage"
                                        ? "Percentage"
                                        : "Fixed Amount"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Discount Value
                                </span>
                                <p className="text-lg font-medium">
                                    {discountDisplay}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Minimum Order Value
                                </span>
                                <p className="text-lg font-medium">
                                    {data.min_order_value
                                        ? `$${data.min_order_value}`
                                        : "None"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Status
                                </span>
                                <div>
                                    <Badge
                                        variant={
                                            data.is_active
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {data.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Valid From
                                </span>
                                <p className="text-lg font-medium">
                                    {data.valid_from
                                        ? new Date(
                                              data.valid_from,
                                          ).toLocaleDateString()
                                        : "Not set"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Valid Until
                                </span>
                                <p className="text-lg font-medium">
                                    {data.valid_until
                                        ? new Date(
                                              data.valid_until,
                                          ).toLocaleDateString()
                                        : "No expiration"}
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="usage" className="flex-1 p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Times Used
                                </span>
                                <p className="text-xl font-semibold">
                                    {data.usage_count}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Usage Limit
                                </span>
                                <p className="text-xl font-semibold">
                                    {data.usage_limit ?? "Unlimited"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Max Uses Per User
                                </span>
                                <p className="text-xl font-semibold">
                                    {data.max_uses_per_user ?? "No limit"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Stackable
                                </span>
                                <div>
                                    <Badge
                                        variant={
                                            data.is_stackable
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {data.is_stackable ? "Yes" : "No"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Priority
                                </span>
                                <p className="text-xl font-semibold">
                                    {data.priority}
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="scope" className="flex-1 p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Applies To
                                </span>
                                <p className="text-lg font-medium">
                                    {data.bouquets.length === 0 &&
                                    data.categories.length === 0
                                        ? "All Bouquets"
                                        : "Specific items"}
                                </p>
                            </div>

                            {data.categories.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">
                                        Categories
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {data.categories.map((category) => (
                                            <Badge
                                                key={category.id}
                                                variant="outline"
                                            >
                                                {category.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {data.bouquets.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">
                                        Specific Bouquets
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {data.bouquets.map((bouquet) => (
                                            <Badge
                                                key={bouquet.id}
                                                variant="outline"
                                            >
                                                {bouquet.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {data.bouquets.length === 0 &&
                                data.categories.length === 0 && (
                                    <div className="p-4 bg-muted/30 rounded-lg">
                                        <p className="text-sm text-muted-foreground">
                                            This coupon applies to all bouquets
                                            in the store.
                                        </p>
                                    </div>
                                )}
                        </div>
                    </TabsContent>
                </Tabs>
            </section>
        </main>
    );
}
