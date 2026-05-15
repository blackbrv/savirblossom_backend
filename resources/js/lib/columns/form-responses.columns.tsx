import { ColumnDef } from "@tanstack/react-table";
import { FormResponseType, useDeleteFormResponse } from "@/services/Forms/FormResponsesApi";
import { ActionsCell } from "./ActionsCell";

function createActionsColumn() {
    return {
        accessorKey: "id",
        header: "Actions",
        cell: ({
            getValue,
            row,
        }: {
            getValue: () => unknown;
            row: { original: FormResponseType };
        }) => {
            const deleteMutation = useDeleteFormResponse();
            const id = getValue() as number;
            const submission = row.original;

            return (
                <ActionsCell
                    id={id}
                    name={`Submission #${id}`}
                    previewHref={`/dashboard/form-responses/${id}`}
                    editHref={`/dashboard/form-responses/${id}`}
                    onDelete={() => deleteMutation.mutateAsync(id)}
                    isDeleting={deleteMutation.isPending}
                />
            );
        },
    } as ColumnDef<FormResponseType>;
}

export const formResponseColumns: ColumnDef<FormResponseType>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "form",
        header: "Form",
        cell: ({ row }) => {
            return row.original.form?.name ?? "-";
        },
    },
    {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => {
            const customer = row.original.customer;
            return customer ? customer.username : "Guest";
        },
    },
    {
        id: "first_question",
        header: "First Answer",
        cell: ({ row }) => {
            const label = row.original.first_question_label;
            const value = row.original.first_answer_value;
            if (!label && !value) return "-";
            const display = value ?? "-";
            return `${label ? label + ": " : ""}${display}`;
        },
    },
    {
        accessorKey: "submitted_at",
        header: "Submitted",
        cell: ({ row }) => {
            return new Date(row.original.submitted_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        },
    },
    createActionsColumn(),
];
