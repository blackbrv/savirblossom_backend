import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    useFeedbackTemplates,
    useDeleteFeedbackTemplate,
    FeedbackQuestionsTemplateType,
} from "@/services/Feedback/FeedbackQuestionsApi";
import {
    Plus,
    X,
    Pencil,
    Trash2,
    Eye,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import DeleteConfirmationDialog from "@/src/components/ui/DeleteConfirmationDialog";

export default function FeedbackQuestions() {
    const [page, setPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);
    const [search, setSearch] = React.useState("");
    const [activeFilter, setActiveFilter] = React.useState<boolean | undefined>(
        undefined,
    );
    const [expandedTemplates, setExpandedTemplates] = React.useState<
        Set<number>
    >(new Set());
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [templateToDelete, setTemplateToDelete] =
        React.useState<FeedbackQuestionsTemplateType | null>(null);

    const debouncedSearch = useDebounce(search, 400);

    React.useEffect(() => {
        setPage(1);
    }, [debouncedSearch, activeFilter]);

    const { data, isLoading } = useFeedbackTemplates({
        page,
        perPage,
        search: debouncedSearch || undefined,
    });

    const deleteMutation = useDeleteFeedbackTemplate();

    const templates = data?.data ?? [];
    const currentPage = data?.meta?.current_page ?? 1;
    const lastPage = data?.meta?.last_page ?? 1;
    const total = data?.meta?.total ?? 0;

    const clearFilters = () => {
        setSearch("");
        setActiveFilter(undefined);
        setPage(1);
    };

    const hasActiveFilters = search !== "" || activeFilter !== undefined;

    const toggleExpand = (id: number) => {
        setExpandedTemplates((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleDeleteClick = (template: FeedbackQuestionsTemplateType) => {
        setTemplateToDelete(template);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (templateToDelete) {
            try {
                await deleteMutation.mutateAsync(templateToDelete.id);
                setDeleteDialogOpen(false);
                setTemplateToDelete(null);
            } catch {
                // Error handled by mutation
            }
        }
    };

    const getQuestionTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            star_rating: "Star Rating",
            text: "Text",
            yes_no: "Yes/No",
            yes_no_reason: "Yes/No + Reason",
        };
        return labels[type] || type;
    };

    return (
        <main className="h-screen mx-auto flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Feedback Questions
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg overflow-auto">
                <div className="flex gap-3 items-center justify-between">
                    <Button className="capitalize" asChild>
                        <a href="/dashboard/feedback/questions/create">
                            <Plus className="text-primary-foreground" />
                            Create New Template
                        </a>
                    </Button>
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

                <div className="flex flex-wrap justify-between items-start gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="flex flex-wrap gap-3 items-end">
                        <Select
                            value={
                                activeFilter === true
                                    ? "active"
                                    : activeFilter === false
                                      ? "inactive"
                                      : "all"
                            }
                            onValueChange={(val) => {
                                setActiveFilter(
                                    val === "all"
                                        ? undefined
                                        : val === "active",
                                );
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full md:w-auto md:max-w-52">
                        <Input
                            placeholder="Search templates..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="border border-border rounded-md overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Questions</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Default</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center"
                                    >
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : templates.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center"
                                    >
                                        No templates found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                templates.map((template) => (
                                    <React.Fragment key={template.id}>
                                        <TableRow>
                                            <TableCell>{template.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            toggleExpand(
                                                                template.id,
                                                            )
                                                        }
                                                        className="p-1 hover:bg-muted rounded"
                                                    >
                                                        {expandedTemplates.has(
                                                            template.id,
                                                        ) ? (
                                                            <ChevronDown className="size-4" />
                                                        ) : (
                                                            <ChevronRight className="size-4" />
                                                        )}
                                                    </button>
                                                    <span className="font-medium">
                                                        {template.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {template.questions_count ?? 0}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 text-xs rounded ${
                                                        template.is_active
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {template.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {template.is_default && (
                                                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                                                        Default
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            toggleExpand(
                                                                template.id,
                                                            )
                                                        }
                                                    >
                                                        <Eye className="size-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <a
                                                            href={`/dashboard/feedback/questions/${template.id}/edit`}
                                                        >
                                                            <Pencil className="size-4" />
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteClick(
                                                                template,
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
                                            </TableCell>
                                        </TableRow>
                                        {expandedTemplates.has(template.id) && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="bg-muted/20 p-0"
                                                >
                                                    <div className="p-4 space-y-3">
                                                        <h4 className="text-sm font-medium">
                                                            Questions
                                                        </h4>
                                                        {template.questions &&
                                                        template.questions
                                                            .length > 0 ? (
                                                            <ul className="space-y-2">
                                                                {template.questions.map(
                                                                    (
                                                                        q,
                                                                        idx,
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                q.id
                                                                            }
                                                                            className="flex items-start gap-3 p-2 bg-background rounded border"
                                                                        >
                                                                            <span className="text-sm text-muted-foreground w-6">
                                                                                {idx +
                                                                                    1}

                                                                                .
                                                                            </span>
                                                                            <div className="flex-1">
                                                                                <p className="text-sm font-medium">
                                                                                    {
                                                                                        q.question_text
                                                                                    }
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    Type:{" "}
                                                                                    {getQuestionTypeLabel(
                                                                                        q.question_type,
                                                                                    )}
                                                                                    {q.is_required &&
                                                                                        " • Required"}
                                                                                </p>
                                                                            </div>
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">
                                                                No questions yet
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </TableBody>
                    </Table>
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
                            of {total} templates
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
                title="Delete Template"
                description={`Are you sure you want to delete "${
                    templateToDelete?.name ?? ""
                }"? This will also delete all questions in this template.`}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                isLoading={deleteMutation.isPending}
            />
        </main>
    );
}
