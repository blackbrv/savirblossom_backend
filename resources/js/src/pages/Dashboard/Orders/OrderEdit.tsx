import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    useOrderById,
    useUpdateOrder,
    UpdateOrderData,
    OrderItemData,
} from "@/services/Orders/OrdersApi";
import { useCustomers, CustomerType } from "@/services/Customers/CustomersApi";
import {
    useBouquets,
    GetBouquetsResponse,
} from "@/services/Bouquets/BouquetsApi";
import { useParams } from "react-router";
import { priceFormatter } from "@/utils/utility";

type OrderFormData = {
    customer_id: number | null;
    items: Array<{
        bouquet_id: number;
        quantity: number;
    }>;
    shipping_address: string;
    notes: string;
    status: string;
};

const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
] as const;

export default function OrderEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading } = useOrderById({ id: Number(id) });
    const { data: customersData } = useCustomers({ perPage: 1000 });
    const { data: bouquetsData } = useBouquets({ perPage: 1000 });
    const updateOrderMutation = useUpdateOrder();

    const order = data?.data;
    const customers = customersData?.data ?? [];
    const bouquets = bouquetsData?.data ?? [];

    const [selectedCustomerId, setSelectedCustomerId] = React.useState<
        number | null
    >(null);
    const [orderItems, setOrderItems] = React.useState<OrderItemData[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<OrderFormData>({
        defaultValues: {
            customer_id: null,
            items: [],
            shipping_address: "",
            notes: "",
            status: "pending",
        },
    });

    const selectedStatus = watch("status");

    React.useEffect(() => {
        if (order) {
            setSelectedCustomerId(order.customer_id);
            setOrderItems(
                order.items.map((item) => ({
                    bouquet_id: item.bouquet_id,
                    quantity: item.quantity,
                })),
            );
            reset({
                customer_id: order.customer_id,
                shipping_address: order.shipping_address,
                notes: order.notes ?? "",
                status: order.status,
            });
        }
    }, [order, reset]);

    const calculateTotal = React.useCallback(() => {
        return orderItems.reduce((total, item) => {
            const bouquet = bouquets.find(
                (b: GetBouquetsResponse) => b.id === item.bouquet_id,
            );
            if (bouquet) {
                return total + parseInt(bouquet.price) * item.quantity;
            }
            return total;
        }, 0);
    }, [orderItems, bouquets]);

    const addItem = () => {
        setOrderItems((prev) => [...prev, { bouquet_id: 0, quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        setOrderItems((prev) => prev.filter((_, i) => i !== index));
    };

    const updateItem = (
        index: number,
        field: "bouquet_id" | "quantity",
        value: number,
    ) => {
        setOrderItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item,
            ),
        );
    };

    const onSubmit = async (formData: OrderFormData) => {
        const validItems = orderItems.filter(
            (item) => item.bouquet_id > 0 && item.quantity > 0,
        );

        if (validItems.length === 0) {
            toast.error("Please add at least one item", {
                position: "top-center",
            });
            return;
        }

        try {
            await updateOrderMutation.mutateAsync({
                id: Number(id),
                data: {
                    customer_id: selectedCustomerId,
                    items: validItems,
                    shipping_address: formData.shipping_address,
                    notes: formData.notes || undefined,
                    status: formData.status as UpdateOrderData["status"],
                },
            });

            navigate(`/dashboard/orders/${id}`);
        } catch (error) {
            console.error(error);
        }
    };

    const total = calculateTotal();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">Loading...</span>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">Order not found</span>
            </div>
        );
    }

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Edit Order #{order.id}
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg overflow-auto">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/dashboard/orders/${id}`)}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Order
                    </Button>
                    <Button
                        type="submit"
                        form="order-form"
                        disabled={isSubmitting}
                    >
                        Save Changes
                    </Button>
                </div>

                <form
                    id="order-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex-1 p-6 space-y-6 overflow-auto"
                >
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={selectedStatus}
                                onValueChange={(val) =>
                                    val && setValue("status", val)
                                }
                            >
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ORDER_STATUSES.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status.charAt(0).toUpperCase() +
                                                status.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customer">
                                Customer (optional)
                            </Label>
                            <Select
                                value={selectedCustomerId?.toString() ?? "none"}
                                onValueChange={(val) => {
                                    if (val)
                                        setSelectedCustomerId(
                                            val === "none" ? null : Number(val),
                                        );
                                }}
                            >
                                <SelectTrigger id="customer">
                                    <SelectValue placeholder="Select customer or leave empty for guest order" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        Guest Order
                                    </SelectItem>
                                    {customers.map((customer: CustomerType) => (
                                        <SelectItem
                                            key={customer.id}
                                            value={customer.id.toString()}
                                        >
                                            {customer.username} (
                                            {customer.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Items *</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addItem}
                                    className="gap-2"
                                >
                                    <Plus className="size-4" />
                                    Add Item
                                </Button>
                            </div>

                            {orderItems.length === 0 ? (
                                <div className="flex items-center justify-center h-32 border border-dashed rounded-lg">
                                    <span className="text-muted-foreground">
                                        No items added. Click "Add Item" to add
                                        products.
                                    </span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orderItems.map((item, index) => {
                                        const selectedBouquet = bouquets.find(
                                            (b: GetBouquetsResponse) =>
                                                b.id === item.bouquet_id,
                                        );

                                        return (
                                            <div
                                                key={index}
                                                className="flex items-end gap-3 p-3 border rounded-lg"
                                            >
                                                <div className="flex-1 space-y-2">
                                                    <Label
                                                        htmlFor={`item-bouquet-${index}`}
                                                    >
                                                        Bouquet
                                                    </Label>
                                                    <Select
                                                        value={
                                                            item.bouquet_id?.toString() ??
                                                            "none"
                                                        }
                                                        onValueChange={(
                                                            val,
                                                        ) => {
                                                            if (val) {
                                                                updateItem(
                                                                    index,
                                                                    "bouquet_id",
                                                                    Number(val),
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger
                                                            id={`item-bouquet-${index}`}
                                                        >
                                                            <SelectValue placeholder="Select bouquet" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {bouquets.map(
                                                                (
                                                                    bouquet: GetBouquetsResponse,
                                                                ) => (
                                                                    <SelectItem
                                                                        key={
                                                                            bouquet.id
                                                                        }
                                                                        value={bouquet.id.toString()}
                                                                    >
                                                                        {
                                                                            bouquet.name
                                                                        }{" "}
                                                                        -{" "}
                                                                        {priceFormatter(
                                                                            parseInt(
                                                                                bouquet.price,
                                                                            ),
                                                                        )}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="w-24 space-y-2">
                                                    <Label
                                                        htmlFor={`item-quantity-${index}`}
                                                    >
                                                        Quantity
                                                    </Label>
                                                    <Input
                                                        id={`item-quantity-${index}`}
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            updateItem(
                                                                index,
                                                                "quantity",
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 1,
                                                            );
                                                        }}
                                                    />
                                                </div>

                                                <div className="w-32 space-y-2">
                                                    <Label>Subtotal</Label>
                                                    <div className="h-10 px-3 py-2 text-sm">
                                                        {selectedBouquet
                                                            ? priceFormatter(
                                                                  parseInt(
                                                                      selectedBouquet.price,
                                                                  ) *
                                                                      item.quantity,
                                                              )
                                                            : "-"}
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        removeItem(index)
                                                    }
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shipping_address">
                                Shipping Address *
                            </Label>
                            <Textarea
                                id="shipping_address"
                                {...register("shipping_address", {
                                    required: "Shipping address is required",
                                })}
                                placeholder="Enter the shipping address"
                                rows={3}
                                aria-invalid={!!errors.shipping_address}
                            />
                            {errors.shipping_address && (
                                <span className="text-sm text-destructive">
                                    {errors.shipping_address.message}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <Textarea
                                id="notes"
                                {...register("notes")}
                                placeholder="Add any additional notes"
                                rows={3}
                            />
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold">
                                    Total:
                                </span>
                                <span className="text-xl font-bold">
                                    {priceFormatter(total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </form>
            </section>
        </main>
    );
}
