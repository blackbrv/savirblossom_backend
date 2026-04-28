import { ColumnDef } from "@tanstack/react-table";
import {
    FeedbackQuestionsTemplateType,
    useDeleteFeedbackTemplate,
} from "@/services/Feedback/FeedbackQuestionsApi";
import { ActionsCell } from "./ActionsCell";

function createFeedbackTemplateActionsColumn() {
    return {
        accessorKey: "id",
        header: "Actions",
        cell: ({
            getValue,
            row,
        }: {
            getValue: () => unknown;
            row: { original: FeedbackQuestionsTemplateType };
        }) => {
            const deleteTemplateMutation = useDeleteFeedbackTemplate();
            const id = getValue() as number;
            const template = row.original;

            return (
                <ActionsCell
                    id={id}
                    name={template.name}
                    previewHref={`/dashboard/feedback/questions/${id}`}
                    editHref={`/dashboard/feedback/questions/${id}/edit`}
                    onDelete={() => deleteTemplateMutation.mutateAsync(id)}
                    isDeleting={deleteTemplateMutation.isPending}
                />
            );
        },
    } as ColumnDef<FeedbackQuestionsTemplateType>;
}

export const feedbackTemplateColumns: ColumnDef<FeedbackQuestionsTemplateType>[] =
    [
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
            accessorKey: "is_default",
            header: "Default",
            cell: ({ row }) => {
                return row.original.is_default ? (
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                        Default
                    </span>
                ) : null;
            },
        },
        createFeedbackTemplateActionsColumn(),
    ];
