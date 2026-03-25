import { OrderType, useDeleteOrder } from "@/services/Orders/OrdersApi";
import { ActionsCell } from "./ActionsCell";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { priceFormatter } from "@/utils/utility";
import { ColumnDef } from "@tanstack/react-table";

function createOrderActionsColumn() {
    return {
        accessorKey: "id",
        header: "Actions",
        cell: ({
            getValue,
            row,
        }: {
            getValue: () => unknown;
            row: { original: OrderType };
        }) => {
            const deleteOrderMutation = useDeleteOrder();
            const id = getValue() as number;
            const orderId = row.original.id;
            return (
                <ActionsCell
                    id={id}
                    name={`Order #${orderId}`}
                    previewHref={`/dashboard/orders/${id}`}
                    editHref={`/dashboard/orders/${id}/edit`}
                    onDelete={() => deleteOrderMutation.mutateAsync(id)}
                    isDeleting={deleteOrderMutation.isPending}
                />
            );
        },
    } as ColumnDef<OrderType>;
}

export const orderColumns: ColumnDef<OrderType>[] = [
    {
        accessorKey: "id",
        header: "Id",
    },
    {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ getValue }) => {
            const customer = getValue() as OrderType["customer"];
            return customer ? (
                customer.username
            ) : (
                <span className="text-muted-foreground italic">Guest</span>
            );
        },
    },
    {
        accessorKey: "items",
        header: "Items",
        cell: ({ getValue }) => {
            const items = getValue() as OrderType["items"];
            return items?.length || 0;
        },
    },
    {
        accessorKey: "shipping_address",
        header: "Shipping Address",
        cell: ({ getValue }) => {
            const address = getValue() as string;
            return (
                <span className="whitespace-normal break-words max-w-[200px] block">
                    {address}
                </span>
            );
        },
    },
    {
        accessorKey: "total",
        header: "Total",
        cell: ({ getValue }) => {
            const value = getValue() as string;
            return priceFormatter(parseInt(value));
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
            const status = getValue() as OrderType["status"];
            return <StatusBadge status={status} />;
        },
    },
    {
        accessorKey: "invoice.status",
        header: "Payment",
        cell: ({ row }) => {
            const invoice = row.original.invoice;
            if (!invoice) {
                return (
                    <span className="text-muted-foreground italic">
                        No invoice
                    </span>
                );
            }
            const paymentStatus = invoice.status;
            return <StatusBadge status={paymentStatus} />;
        },
    },
    {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ getValue }) => {
            const value = getValue() as string;
            return new Date(value).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        },
    },
    createOrderActionsColumn(),
];
