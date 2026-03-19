import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function Categories() {
    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const [publishedFilter, setPublishedFilter] = React.useState<
        boolean | undefined
    >(undefined);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useBouquetCategories({
        page,
        unfilterred: true,
        search: debouncedSearch || undefined,
        published: publishedFilter,
    });

    const categories = data?.data ?? [];
    const currentPage = data?.current_page ?? 1;
    const lastPage = data?.last_page ?? 1;

    const clearFilters = () => {
        setSearch("");
        setDebouncedSearch("");
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
                    columns={categoryColumns}
                    data={categories}
                    loading={isLoading}
                    rowCount={10}
                />

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
            </section>
        </main>
    );
}
