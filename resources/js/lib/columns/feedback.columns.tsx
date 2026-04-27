import { ColumnDef } from "@tanstack/react-table";
import {
    FeedbackResponseType,
    useDeleteFeedback,
} from "@/services/Feedback/FeedbackApi";
import { ActionsCell } from "./ActionsCell";

function createFeedbackActionsColumn() {
    return {
        accessorKey: "id",
        header: "Actions",
        cell: ({
            getValue,
            row,
        }: {
            getValue: () => unknown;
            row: { original: FeedbackResponseType };
        }) => {
            const deleteFeedbackMutation = useDeleteFeedback();
            const id = getValue() as number;
            const feedback = row.original;
            const name = feedback.customer
                ? `${feedback.customer.username}'s Feedback`
                : `Feedback #${id}`;

            return (
                <ActionsCell
                    id={id}
                    name={name}
                    previewHref={`/dashboard/feedback/${id}`}
                    editHref={`/dashboard/feedback/${id}/edit`}
                    onDelete={() => deleteFeedbackMutation.mutateAsync(id)}
                    isDeleting={deleteFeedbackMutation.isPending}
                />
            );
        },
    } as ColumnDef<FeedbackResponseType>;
}

export const feedbackColumns: ColumnDef<FeedbackResponseType>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => {
            const customer = row.original.customer;
            return customer
                ? `${customer.username} (${customer.email})`
                : "Guest";
        },
    },
    {
        accessorKey: "order",
        header: "Order",
        cell: ({ row }) => {
            const order = row.original.order;
            return order ? `#${order.id}` : "-";
        },
    },
    {
        accessorKey: "bouquet",
        header: "Bouquet",
        cell: ({ row }) => {
            return row.original.bouquet?.name || "-";
        },
    },
    {
        accessorKey: "average_rating",
        header: "Rating",
        cell: ({ row }) => {
            const rating = row.original.average_rating;
            if (rating) {
                return (
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{rating.toFixed(1)}</span>
                    </div>
                );
            }
            return "-";
        },
    },
    {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => {
            const date = new Date(row.original.created_at);
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        },
    },
    createFeedbackActionsColumn(),
];
