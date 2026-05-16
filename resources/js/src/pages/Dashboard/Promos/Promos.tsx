import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import DataTable from "@/src/components/ui/DataTable";
import { usePromos, type PromoType } from "@/services/Promos/PromosApi";
import { promoColumns } from "@/lib/columns";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export default function Promos() {
    const navigate = useNavigate();
    const [page, setPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);
    const [search, setSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<string | undefined>(
        undefined,
    );

    const debouncedSearch = useDebounce(search, 400);

    React.useEffect(() => {
        setPage(1);
    }, [debouncedSearch, statusFilter]);

    const { data, isLoading } = usePromos({
        page,
        perPage,
        search: debouncedSearch || undefined,
        status: statusFilter,
    });

    const promos = data?.data ?? [];
    const currentPage = data?.meta?.current_page ?? 1;
    const lastPage = data?.meta?.last_page ?? 1;
    const total = data?.meta?.total ?? 0;

    const clearFilters = () => {
        setSearch("");
        setStatusFilter(undefined);
        setPage(1);
    };

    const hasActiveFilters = search !== "" || statusFilter !== undefined;

    return (
        <main className="h-screen mx-auto flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">Promos</h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg overflow-auto">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        className="capitalize"
                        onClick={() => navigate("/dashboard/promos/create")}
                    >
                        <Plus className="text-primary-foreground" />
                        Create New Promo
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
                            value={statusFilter ?? "all"}
                            onValueChange={(val) => {
                                setStatusFilter(
                                    val === "all" ? undefined : val,
                                );
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="scheduled">
                                    Scheduled
                                </SelectItem>
                                <SelectItem value="published">
                                    Published
                                </SelectItem>
                                <SelectItem value="archived">
                                    Archived
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full md:w-auto md:max-w-52">
                        <Input
                            placeholder="Search promos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>

                <DataTable
                    columns={promoColumns as ColumnDef<unknown, unknown>[]}
                    data={promos as PromoType[]}
                    loading={isLoading}
                />

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
                            of {total} promos
                        </span>
                    </div>

                    {lastPage > 1 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.max(1, p - 1),
                                            )
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
