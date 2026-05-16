import { ColumnDef } from "@tanstack/react-table";
import { Mail, MailCheck, MailX } from "lucide-react";
import type { SubscriberType } from "@/services/Newsletter/NewsletterApi";
import {
    useDeleteSubscriber,
    useToggleSubscriber,
} from "@/services/Newsletter/SubscribersApi";
import { ActionsCell } from "./ActionsCell";

export const subscriberColumns: ColumnDef<SubscriberType>[] = [
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <span className="font-medium">{row.original.email}</span>
            </div>
        ),
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => row.original.name ?? "-",
    },
    {
        accessorKey: "is_subscribed",
        header: "Status",
        cell: ({ row }) => {
            const subscribed = row.original.is_subscribed;
            return (
                <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        subscribed
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                >
                    {subscribed ? (
                        <MailCheck className="size-3" />
                    ) : (
                        <MailX className="size-3" />
                    )}
                    {subscribed ? "Subscribed" : "Unsubscribed"}
                </span>
            );
        },
    },
    {
        accessorKey: "subscribed_at",
        header: "Subscribed Date",
        cell: ({ row }) =>
            row.original.subscribed_at
                ? new Date(row.original.subscribed_at).toLocaleDateString()
                : "-",
    },
    {
        accessorKey: "last_promo_sent_at",
        header: "Last Promo Sent",
        cell: ({ row }) =>
            row.original.last_promo_sent_at
                ? new Date(
                      row.original.last_promo_sent_at,
                  ).toLocaleDateString()
                : "-",
    },
    {
        accessorKey: "id",
        header: "Actions",
        cell: ({ getValue, row }) => {
            const id = getValue() as number;
            const deleteMutation = useDeleteSubscriber();
            const toggleMutation = useToggleSubscriber();
            const subscriber = row.original;

            return (
                <div className="flex gap-2 items-center">
                    <ActionsCell
                        id={id}
                        name={subscriber.email}
                        editHref={`/dashboard/newsletter/${id}`}
                        onDelete={() => deleteMutation.mutateAsync(id)}
                        isDeleting={deleteMutation.isPending}
                    />
                    <button
                        onClick={() => toggleMutation.mutate(id)}
                        className="text-xs text-primary hover:underline"
                    >
                        {subscriber.is_subscribed ? "Unsubscribe" : "Subscribe"}
                    </button>
                </div>
            );
        },
    },
];
