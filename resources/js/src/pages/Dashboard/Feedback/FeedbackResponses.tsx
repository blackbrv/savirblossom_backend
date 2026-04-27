import React from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    useFeedbackResponses,
    useDeleteFeedback,
    FeedbackResponseType,
} from "@/services/Feedback/FeedbackApi";
import { X, Trash2, Eye } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import DeleteConfirmationDialog from "@/src/components/ui/DeleteConfirmationDialog";

export default function FeedbackResponses() {
    const [page, setPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);
    const [search, setSearch] = React.useState("");
    const [expandedResponses, setExpandedResponses] = React.useState<
        Set<number>
    >(new Set());
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [responseToDelete, setResponseToDelete] =
        React.useState<FeedbackResponseType | null>(null);

    const debouncedSearch = useDebounce(search, 400);

    React.useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const { data, isLoading } = useFeedbackResponses({
        page,
        perPage,
    });

    const deleteMutation = useDeleteFeedback();

    const responses = data?.data ?? [];
    const currentPage = data?.meta?.current_page ?? 1;
    const lastPage = data?.meta?.last_page ?? 1;
    const total = data?.meta?.total ?? 0;

    const clearFilters = () => {
        setSearch("");
        setPage(1);
    };

    const hasActiveFilters = search !== "";

    const toggleExpand = (id: number) => {
        setExpandedResponses((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleDeleteClick = (response: FeedbackResponseType) => {
        setResponseToDelete(response);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (responseToDelete) {
            try {
                await deleteMutation.mutateAsync(responseToDelete.id);
                setDeleteDialogOpen(false);
                setResponseToDelete(null);
            } catch {
                // Error handled by mutation
            }
        }
    };

    const renderAnswer = (answer: FeedbackResponseType["answers"][0]) => {
        if (answer.rating_value) {
            return (
                <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                        <span
                            key={i}
                            className={
                                i < answer.rating_value!
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                            }
                        >
                            ★
                        </span>
                    ))}
                    <span className="ml-2 text-sm">
                        ({answer.rating_value}/5)
                    </span>
                </div>
            );
        }

        if (answer.boolean_value !== null) {
            return (
                <span
                    className={
                        answer.boolean_value ? "text-green-600" : "text-red-600"
                    }
                >
                    {answer.boolean_value ? "Yes" : "No"}
                    {answer.reason_value && ` - ${answer.reason_value}`}
                </span>
            );
        }

        if (answer.text_value) {
            return <span>{answer.text_value}</span>;
        }

        return <span className="text-muted-foreground">-</span>;
    };

    return (
        <main className="h-screen mx-auto flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Feedback Responses
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg overflow-auto">
                <div className="flex gap-3 items-center justify-between">
                    <span className="text-muted-foreground">
                        {total} feedback response{total !== 1 ? "s" : ""}
                    </span>
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="flex items-center gap-2"
                        >
                            <X className="size-4" />
                            Clear Filters
                        </Button>
                    )}
                </div>

                <div className="border border-border rounded-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground w-10">
                                    ID
                                </th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                                    Customer
                                </th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                                    Order
                                </th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                                    Bouquet
                                </th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                                    Rating
                                </th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                                    Date
                                </th>
                                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            ) : responses.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        No feedback responses yet
                                    </td>
                                </tr>
                            ) : (
                                responses.map((response) => (
                                    <React.Fragment key={response.id}>
                                        <tr className="hover:bg-muted/30">
                                            <td className="px-4 py-3 text-sm">
                                                {response.id}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {response.customer
                                                    ? `${response.customer.username} (${response.customer.email})`
                                                    : "Guest"}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {response.order
                                                    ? `#${response.order.id}`
                                                    : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {response.bouquet?.name || "-"}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {response.average_rating ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-yellow-500">
                                                            ★
                                                        </span>
                                                        <span>
                                                            {response.average_rating.toFixed(
                                                                1,
                                                            )}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {new Date(
                                                    response.created_at,
                                                ).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            toggleExpand(
                                                                response.id,
                                                            )
                                                        }
                                                    >
                                                        <Eye className="size-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteClick(
                                                                response,
                                                            )
                                                        }
                                                        disabled={
                                                            deleteMutation.isPending
                                                        }
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedResponses.has(response.id) && (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="px-4 py-3 bg-muted/20"
                                                >
                                                    <div className="pl-4 space-y-3">
                                                        <h4 className="text-sm font-medium">
                                                            Answers
                                                        </h4>
                                                        {response.answers &&
                                                        response.answers
                                                            .length > 0 ? (
                                                            <div className="space-y-2">
                                                                {response.answers.map(
                                                                    (
                                                                        answer,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                answer.id
                                                                            }
                                                                            className="grid col-span-2 items-start gap-4 p-3 bg-background rounded border"
                                                                        >
                                                                            {/* <span className="text-sm text-muted-foreground"> */}
                                                                            {/*     {answer */}
                                                                            {/*         .question */}
                                                                            {/*         ?.question_text || */}
                                                                            {/*         "Q"} */}
                                                                            {/* </span> */}
                                                                            <div className="flex-1">
                                                                                {answer.question && (
                                                                                    <p className="text-sm font-medium text-muted-foreground">
                                                                                        {
                                                                                            answer
                                                                                                .question
                                                                                                .question_text
                                                                                        }
                                                                                    </p>
                                                                                )}
                                                                                <div className="text-sm">
                                                                                    {renderAnswer(
                                                                                        answer,
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">
                                                                No answers yet
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Per page:
                            </span>
                            <Select
                                value={perPage.toString()}
                                onValueChange={(val) => {
                                    setPerPage(Number(val));
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 20, 30, 40, 50].map((num) => (
                                        <SelectItem
                                            key={num}
                                            value={num.toString()}
                                        >
                                            {num}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            of {total} responses
                        </span>
                    </div>

                    {lastPage > 1 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() =>
                                            setPage((p) => Math.max(1, p - 1))
                                        }
                                        className={
                                            currentPage === 1
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer"
                                        }
                                    />
                                </PaginationItem>
                                {Array.from(
                                    { length: lastPage },
                                    (_, i) => i + 1,
                                ).map((pageNum) => (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            isActive={pageNum === currentPage}
                                            onClick={() => setPage(pageNum)}
                                            className="cursor-pointer"
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.min(lastPage, p + 1),
                                            )
                                        }
                                        className={
                                            currentPage === lastPage
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer"
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            </section>

            <DeleteConfirmationDialog
                title="Delete Feedback"
                description={`Are you sure you want to delete this feedback response?`}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                isLoading={deleteMutation.isPending}
            />
        </main>
    );
}
