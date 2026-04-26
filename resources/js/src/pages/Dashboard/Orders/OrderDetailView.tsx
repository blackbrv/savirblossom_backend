import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    OrderType,
    useMarkInvoicePaid,
    useDeleteOrder,
} from "@/services/Orders/OrdersApi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DeleteConfirmationDialog from "@/src/components/ui/DeleteConfirmationDialog";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { priceFormatter } from "@/utils/utility";

type OrderDetailViewProps = {
    data?: OrderType;
    isLoading?: boolean;
};

export default function OrderDetailView({
    data,
    isLoading,
}: OrderDetailViewProps) {
    const navigate = useNavigate();
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const markPaidMutation = useMarkInvoicePaid();
    const deleteOrderMutation = useDeleteOrder();

    const handleEdit = React.useCallback(() => {
        navigate(`/dashboard/orders/${data?.id}/edit`);
    }, [navigate, data?.id]);

    const handleDelete = React.useCallback(async () => {
        if (data?.id) {
            try {
                await deleteOrderMutation.mutateAsync(data.id);
                toast.success("Order deleted successfully", {
                    position: "top-center",
                });
                navigate("/dashboard/orders");
            } catch (error) {
                console.error(error);
            }
        }
    }, [data?.id, navigate, deleteOrderMutation]);

    const handleMarkPaid = React.useCallback(() => {
        if (data?.id) {
            markPaidMutation.mutate(data.id);
        }
    }, [data?.id, markPaidMutation]);

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
                <span className="text-muted-foreground">Order not found</span>
            </div>
        );
    }

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <DeleteConfirmationDialog
                title="Delete Order"
                description={`Are you sure you want to delete Order #${data.id}? This action cannot be undone.`}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onConfirm={handleDelete}
                isLoading={markPaidMutation.isPending}
            />
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Order #{data.id}
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg overflow-auto">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/orders")}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Orders
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEdit}
                            className="gap-2"
                        >
                            <Pencil className="size-4" />
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setIsDialogOpen(true)}
                            className="gap-2"
                        >
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="details" className="h-full flex flex-col">
                    <TabsList className="w-fit p-1">
                        <TabsTrigger value="details" className="px-4 py-2">
                            Details
                        </TabsTrigger>
                        <TabsTrigger value="items" className="px-4 py-2">
                            Items
                        </TabsTrigger>
                        <TabsTrigger value="invoice" className="px-4 py-2">
                            Invoice
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="details"
                        className="flex-1 p-6 space-y-6"
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Customer
                                </span>
                                <p className="text-lg font-medium">
                                    {data.customer
                                        ? `${data.customer.username} (${data.customer.email})`
                                        : "Guest"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Status
                                </span>
                                <div>
                                    <StatusBadge status={data.status} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Shipping Address
                                </span>
                                <p className="text-base whitespace-pre-wrap">
                                    {data.shipping_address}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Send Date/Time
                                </span>
                                <p className="text-base">
                                    {new Date(data.send_at).toLocaleDateString(
                                        "en-US",
                                        {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        },
                                    )}
                                </p>
                            </div>

                            {data.notes && (
                                <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">
                                        Notes
                                    </span>
                                    <p className="text-base whitespace-pre-wrap">
                                        {data.notes}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Order Created
                                </span>
                                <p className="text-base">
                                    {new Date(
                                        data.created_at,
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="items" className="flex-1 p-6">
                        {data.items.length === 0 ? (
                            <div className="flex items-center justify-center h-64">
                                <span className="text-muted-foreground">
                                    No items in this order
                                </span>
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                                Bouquet
                                            </th>
                                            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                                                Quantity
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                                                Unit Price
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {data.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 text-sm">
                                                    {item.bouquet?.name ||
                                                        "Unknown Bouquet"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-center">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right">
                                                    {priceFormatter(
                                                        parseInt(
                                                            item.unit_price,
                                                        ),
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right">
                                                    {priceFormatter(
                                                        parseInt(
                                                            item.unit_price,
                                                        ) * item.quantity,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-muted/50">
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="px-4 py-3 text-right font-semibold"
                                            >
                                                Total:
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold">
                                                {priceFormatter(
                                                    parseInt(data.total),
                                                )}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent
                        value="invoice"
                        className="flex-1 p-6 space-y-6"
                    >
                        {data.invoice ? (
                            <div className="space-y-6">
                                <div className="p-6 border rounded-lg space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-lg">
                                            Invoice Details
                                        </h4>
                                        <StatusBadge
                                            status={data.invoice.status}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-sm text-muted-foreground">
                                                Invoice Number
                                            </span>
                                            <p className="font-mono font-medium">
                                                {data.invoice.invoice_number}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-sm text-muted-foreground">
                                                Amount
                                            </span>
                                            <p className="font-semibold text-lg">
                                                {priceFormatter(
                                                    parseInt(
                                                        data.invoice
                                                            .total_amount,
                                                    ),
                                                )}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-sm text-muted-foreground">
                                                Created
                                            </span>
                                            <p>
                                                {new Date(
                                                    data.invoice.created_at,
                                                ).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>

                                        {data.invoice.paid_at && (
                                            <div className="space-y-1">
                                                <span className="text-sm text-muted-foreground">
                                                    Paid On
                                                </span>
                                                <p>
                                                    {new Date(
                                                        data.invoice.paid_at,
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        },
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {data.invoice.status !== "paid" && (
                                        <div className="pt-4 border-t">
                                            <Button
                                                onClick={handleMarkPaid}
                                                disabled={
                                                    markPaidMutation.isPending
                                                }
                                            >
                                                {markPaidMutation.isPending
                                                    ? "Processing..."
                                                    : "Mark as Paid"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <span className="text-muted-foreground">
                                    No invoice found for this order
                                </span>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </section>
        </main>
    );
}
