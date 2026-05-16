import { ColumnDef } from "@tanstack/react-table";
import type { CampaignType } from "@/services/Campaigns/CampaignsApi";
import {
    useDeleteCampaign,
    useQueueCampaign,
} from "@/services/Campaigns/CampaignsApi";
import { ActionsCell } from "./ActionsCell";

const STATUS_BADGES: Record<string, { bg: string; text: string }> = {
    draft: { bg: "bg-gray-100", text: "text-gray-800" },
    queued: { bg: "bg-blue-100", text: "text-blue-800" },
    sending: { bg: "bg-purple-100", text: "text-purple-800" },
    sent: { bg: "bg-green-100", text: "text-green-800" },
    failed: { bg: "bg-red-100", text: "text-red-800" },
    cancelled: { bg: "bg-yellow-100", text: "text-yellow-800" },
};

export const campaignColumns: ColumnDef<CampaignType>[] = [
    {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.subject}</span>
        ),
    },
    {
        accessorKey: "promo",
        header: "Promo",
        cell: ({ row }) => row.original.promo?.title ?? "-",
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
        accessorKey: "total_recipients",
        header: "Recipients",
        cell: ({ row }) => {
            const c = row.original;
            return `${c.sent_count}/${c.total_recipients}`;
        },
    },
    {
        accessorKey: "failed_count",
        header: "Failed",
        cell: ({ row }) => {
            const count = row.original.failed_count;
            return count > 0 ? (
                <span className="text-red-600 font-medium">{count}</span>
            ) : (
                "-"
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
        accessorKey: "id",
        header: "Actions",
        cell: ({ getValue, row }) => {
            const id = getValue() as number;
            const deleteMutation = useDeleteCampaign();
            const campaign = row.original;

            return (
                <div className="flex gap-2 items-center">
                    <ActionsCell
                        id={id}
                        name={campaign.subject}
                        previewHref={`/dashboard/campaigns/${id}`}
                        editHref={`/dashboard/campaigns/${id}/edit`}
                        onDelete={() => deleteMutation.mutateAsync(id)}
                        isDeleting={deleteMutation.isPending}
                    />
                </div>
            );
        },
    },
];
