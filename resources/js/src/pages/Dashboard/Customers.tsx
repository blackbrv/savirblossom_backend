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
import { customerColumns } from "@/lib/columns";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useCustomers, CustomerType } from "@/services/Customers/CustomersApi";
import DataTable from "@/src/components/ui/DataTable";
import { X } from "lucide-react";

export default function Customers() {
    const [page, setPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);
    const [search, setSearch] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const [providerFilter, setProviderFilter] = React.useState<
        string | undefined
    >(undefined);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useCustomers({
        page,
        perPage,
        search: debouncedSearch || undefined,
        provider: providerFilter,
    });

    const customers = data?.data ?? [];
    const currentPage = data?.current_page ?? 1;
    const lastPage = data?.last_page ?? 1;

    const clearFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setProviderFilter(undefined);
        setPage(1);
    };

    const hasActiveFilters = search !== "" || providerFilter !== undefined;

    return (
        <main className="h-screen mx-auto flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Customers
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Customer registration is handled via API
                        </span>
                    </div>
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
                            value={providerFilter ?? "all"}
                            onValueChange={(val) => {
                                setProviderFilter(
                                    val === "all" ? undefined : val,
                                );
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Provider" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Providers
                                </SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="google">Google</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full md:w-auto md:max-w-52">
                        <Input
                            placeholder="Search email or username..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>

                <DataTable
                    columns={customerColumns}
                    data={customers as CustomerType[]}
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
                        <Pagination className="flex mx-0 w-max">
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
