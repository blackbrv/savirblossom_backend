import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { categoryColumns } from "@/lib/columns";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useBouquetCategories } from "@/services/Bouquets/BouquetsApi";
import DataTable from "@/src/components/ui/DataTable";
import { Plus, X } from "lucide-react";
import FilterDropdown from "@/src/components/ui/FilterDropdown";
import { useDebounce } from "@/hooks/useDebounce";
import { ColumnDef } from "@tanstack/react-table";

export default function Categories() {
    const [page, setPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);
    const [search, setSearch] = React.useState("");
    const [publishedFilter, setPublishedFilter] = React.useState<
        boolean | undefined
    >(undefined);

    const debouncedSearch = useDebounce(search, 400);

    React.useEffect(() => {
        setPage(1);
    }, [debouncedSearch, publishedFilter]);

    const { data, isLoading } = useBouquetCategories({
        page,
        perPage,
        unfilterred: true,
        search: debouncedSearch || undefined,
        published: publishedFilter,
    });

    const categories = data?.data ?? [];
    const currentPage = data?.meta?.current_page ?? 1;
    const lastPage = data?.meta?.last_page ?? 1;

    const clearFilters = () => {
        setSearch("");
        setPublishedFilter(undefined);
        setPage(1);
    };

    const hasActiveFilters = search !== "" || publishedFilter !== undefined;

    return (
        <main className="h-screen mx-auto flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Categories
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center justify-between">
                    <Button className="capitalize" asChild>
                        <a href="/dashboard/categories/create">
                            <Plus className="text-primary-foreground" />
                            Create new category
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
                        <FilterDropdown
                            label="Published"
                            value={
                                publishedFilter === true
                                    ? "Published"
                                    : publishedFilter === false
                                      ? "Unpublished"
                                      : undefined
                            }
                            isActive={publishedFilter !== undefined}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setPublishedFilter(undefined);
                                    setPage(1);
                                }}
                                className="text-sm text-left px-2 py-1.5 rounded hover:bg-accent w-full"
                            >
                                All
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setPublishedFilter(true);
                                    setPage(1);
                                }}
                                className="text-sm text-left px-2 py-1.5 rounded hover:bg-accent w-full"
                            >
                                Published
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setPublishedFilter(false);
                                    setPage(1);
                                }}
                                className="text-sm text-left px-2 py-1.5 rounded hover:bg-accent w-full"
                            >
                                Unpublished
                            </button>
                        </FilterDropdown>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full md:w-auto md:max-w-52">
                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>

                <DataTable
                    columns={categoryColumns as ColumnDef<unknown, unknown>[]}
                    data={categories}
                    loading={isLoading}
                />

                <div className="flex justify-between items-center">
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
                                {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(
                                    (num) => (
                                        <SelectItem
                                            key={num}
                                            value={num.toString()}
                                        >
                                            {num}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
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
        </main>
    );
}
