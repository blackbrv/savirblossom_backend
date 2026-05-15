import { ColumnDef } from "@tanstack/react-table";
import { FormType, useDeleteForm } from "@/services/Forms/FormsApi";
import { ActionsCell } from "./ActionsCell";

function createFormActionsColumn() {
    return {
        accessorKey: "id",
        header: "Actions",
        cell: ({
            getValue,
            row,
        }: {
            getValue: () => unknown;
            row: { original: FormType };
        }) => {
            const deleteFormMutation = useDeleteForm();
            const id = getValue() as number;
            const form = row.original;

            return (
                <ActionsCell
                    id={id}
                    name={form.name}
                    previewHref={`/dashboard/form-builder/${id}`}
                    editHref={`/dashboard/form-builder/${id}/edit`}
                    onDelete={() => deleteFormMutation.mutateAsync(id)}
                    isDeleting={deleteFormMutation.isPending}
                />
            );
        },
    } as ColumnDef<FormType>;
}

export const formColumns: ColumnDef<FormType>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "questions",
        header: "Questions",
        cell: ({ row }) => {
            return row.original.questions_count ?? 0;
        },
    },
    {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.is_active;
            return isActive ? (
                <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                    Active
                </span>
            ) : (
                <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                    Inactive
                </span>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
            return new Date(row.original.created_at).toLocaleDateString();
        },
    },
    createFormActionsColumn(),
];
