import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
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
import { orderColumns } from "@/lib/columns";
import { useOrders, OrderType } from "@/services/Orders/OrdersApi";
import DataTable from "@/src/components/ui/DataTable";

export default function Orders() {
    const navigate = useNavigate();
    const [page, setPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);
    const [search, setSearch] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<string | undefined>(
        undefined,
    );
    const [paymentStatusFilter, setPaymentStatusFilter] = React.useState<
        string | undefined
    >(undefined);
    const [dateFrom, setDateFrom] = React.useState<string | undefined>(
        undefined,
    );
    const [dateTo, setDateTo] = React.useState<string | undefined>(undefined);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useOrders({
        page,
        perPage,
        search: debouncedSearch || undefined,
        status: statusFilter,
        payment_status: paymentStatusFilter as
            | "paid"
            | "unpaid"
            | "cancelled"
            | undefined,
        date_from: dateFrom,
        date_to: dateTo,
    });

    const orders = data?.data ?? [];
    const currentPage = data?.current_page ?? 1;
    const lastPage = data?.last_page ?? 1;

    const clearFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setStatusFilter(undefined);
        setPaymentStatusFilter(undefined);
        setDateFrom(undefined);
        setDateTo(undefined);
        setPage(1);
    };

    const hasActiveFilters =
        search !== "" ||
        statusFilter !== undefined ||
        paymentStatusFilter !== undefined ||
        dateFrom !== undefined ||
        dateTo !== undefined;

    return (
        <main className="h-screen mx-auto flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">Orders</h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => navigate("/dashboard/orders/create")}
                            className="gap-2"
                        >
                            <Plus className="size-4" />
                            Create Order
                        </Button>
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
                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-muted-foreground">
                                Order Status
                            </span>
                            <Select
                                value={statusFilter ?? "all"}
                                onValueChange={(val) => {
                                    setStatusFilter(
                                        val === "all" ? undefined : val,
                                    );
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="confirmed">
                                        Confirmed
                                    </SelectItem>
                                    <SelectItem value="processing">
                                        Processing
                                    </SelectItem>
                                    <SelectItem value="shipped">
                                        Shipped
                                    </SelectItem>
                                    <SelectItem value="delivered">
                                        Delivered
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-muted-foreground">
                                Payment Status
                            </span>
                            <Select
                                value={paymentStatusFilter ?? "all"}
                                onValueChange={(val) => {
                                    setPaymentStatusFilter(
                                        val === "all" ? undefined : val,
                                    );
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Payment Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Payment
                                    </SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="unpaid">
                                        Unpaid
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-muted-foreground">
                                From
                            </span>
                            <Input
                                type="date"
                                value={dateFrom ?? ""}
                                onChange={(e) => {
                                    setDateFrom(e.target.value || undefined);
                                    setPage(1);
                                }}
                                className="w-36"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-muted-foreground">
                                To
                            </span>
                            <Input
                                type="date"
                                value={dateTo ?? ""}
                                onChange={(e) => {
                                    setDateTo(e.target.value || undefined);
                                    setPage(1);
                                }}
                                className="w-36"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full md:w-auto md:max-w-52">
                        <Input
                            placeholder="Search order ID or customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>

                <DataTable
                    columns={orderColumns}
                    data={orders as OrderType[]}
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
