import { ColumnDef } from "@tanstack/react-table";
import type { PromoType } from "@/services/Promos/PromosApi";
import { useDeletePromo, usePublishPromo } from "@/services/Promos/PromosApi";
import { ActionsCell } from "./ActionsCell";

const STATUS_BADGES: Record<string, { bg: string; text: string }> = {
    draft: { bg: "bg-gray-100", text: "text-gray-800" },
    scheduled: { bg: "bg-blue-100", text: "text-blue-800" },
    published: { bg: "bg-green-100", text: "text-green-800" },
    archived: { bg: "bg-yellow-100", text: "text-yellow-800" },
};

export const promoColumns: ColumnDef<PromoType>[] = [
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.title}</span>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            const badge = STATUS_BADGES[status] ?? {
                bg: "bg-gray-100",
                text: "text-gray-800",
            };
            return (
                <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs capitalize ${badge.bg} ${badge.text}`}
                >
                    {status}
                </span>
            );
        },
    },
    {
        accessorKey: "scheduled_at",
        header: "Scheduled",
        cell: ({ row }) =>
            row.original.scheduled_at
                ? new Date(row.original.scheduled_at).toLocaleDateString()
                : "-",
    },
    {
        accessorKey: "published_at",
        header: "Published",
        cell: ({ row }) =>
            row.original.published_at
                ? new Date(row.original.published_at).toLocaleDateString()
                : "-",
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) =>
            new Date(row.original.created_at).toLocaleDateString(),
    },
    {
        accessorKey: "id",
        header: "Actions",
        cell: ({ getValue, row }) => {
            const id = getValue() as number;
            const deleteMutation = useDeletePromo();
            const promo = row.original;

            return (
                <div className="flex gap-2 items-center">
                    <ActionsCell
                        id={id}
                        name={promo.title}
                        previewHref={`/dashboard/promos/${id}`}
                        editHref={`/dashboard/promos/${id}/edit`}
                        onDelete={() => deleteMutation.mutateAsync(id)}
                        isDeleting={deleteMutation.isPending}
                    />
                </div>
            );
        },
    },
];
