import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    CustomerType,
    useDeleteCustomer,
} from "@/services/Customers/CustomersApi";
import { ActionsCell } from "./ActionsCell";
import { ColumnDef } from "@tanstack/react-table";

export const selectColumn: ColumnDef<unknown> = {
    id: "select",
    header: ({ table }) => (
        <Checkbox
            checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
        />
    ),
    cell: ({ row }) => (
        <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
        />
    ),
    enableSorting: false,
    enableHiding: false,
};

function createCustomerActionsColumn() {
    return {
        accessorKey: "id",
        header: "Actions",
        cell: ({ getValue, row }: { getValue: () => unknown; row: { original: CustomerType } }) => {
            const deleteCustomerMutation = useDeleteCustomer();
            const id = getValue() as number;
            const { email } = row.original;
            return (
                <ActionsCell
                    id={id}
                    name={email}
                    previewHref={`/dashboard/customers/${id}`}
                    editHref={`/dashboard/customers/${id}/edit`}
                    onDelete={() => deleteCustomerMutation.mutateAsync(id)}
                    isDeleting={deleteCustomerMutation.isPending}
                />
            );
        },
    } as ColumnDef<CustomerType>;
}

export const customerColumns: ColumnDef<CustomerType>[] = [
    selectColumn as ColumnDef<CustomerType>,
    {
        accessorKey: "id",
        header: "Id",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "username",
        header: "Username",
    },
    {
        accessorKey: "phone_number",
        header: "Phone",
        cell: ({ getValue }) => {
            const value = getValue() as string | null;
            return value || "-";
        },
    },
    {
        accessorKey: "provider",
        header: "Provider",
        cell: ({ getValue }) => {
            const value = getValue() as "email" | "google";
            return (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                        value === "google"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    }`}
                >
                    {value === "google" ? "Google" : "Email"}
                </span>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ getValue }) => {
            const value = getValue() as string;
            return new Date(value).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        },
    },
    createCustomerActionsColumn(),
];
