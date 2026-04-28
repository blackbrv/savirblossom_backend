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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import DataTable from "@/src/components/ui/DataTable";
import {
    useFeedbackResponses,
    useFeedbackResponse,
} from "@/services/Feedback/FeedbackApi";
import { feedbackColumns } from "@/lib/columns/feedback.columns";
import { useCustomers } from "@/services/Customers/CustomersApi";
import { useOrders } from "@/services/Orders/OrdersApi";
import { useBouquets } from "@/services/Bouquets/BouquetsApi";
import { ColumnDef } from "@tanstack/react-table";
import { X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export default function FeedbackResponses() {
    const [page, setPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);
    const [search, setSearch] = React.useState("");
    const [customerId, setCustomerId] = React.useState<number | undefined>(
        undefined,
    );
    const [orderId, setOrderId] = React.useState<number | undefined>(undefined);
    const [bouquetId, setBouquetId] = React.useState<number | undefined>(
        undefined,
    );
    const [rating, setRating] = React.useState<number | undefined>(undefined);
    const [dateFrom, setDateFrom] = React.useState<string | undefined>(
        undefined,
    );
    const [dateTo, setDateTo] = React.useState<string | undefined>(undefined);

    const debouncedSearch = useDebounce(search, 400);

    React.useEffect(() => {
        setPage(1);
    }, [
        debouncedSearch,
        customerId,
        orderId,
        bouquetId,
        rating,
        dateFrom,
        dateTo,
    ]);

    const { data: customersData } = useCustomers({ perPage: 1000 });
    const { data: ordersData } = useOrders({ perPage: 1000 });
    const { data: bouquetsData } = useBouquets({ perPage: 1000 });

    const { data, isLoading } = useFeedbackResponses({
        page,
        perPage,
        search: debouncedSearch || undefined,
        customer_id: customerId,
        order_id: orderId,
        bouquet_id: bouquetId,
        rating,
        date_from: dateFrom,
        date_to: dateTo,
    });

    const responses = data?.data ?? [];
    const currentPage = data?.meta?.current_page ?? 1;
    const lastPage = data?.meta?.last_page ?? 1;
    const total = data?.meta?.total ?? 0;

    const customers = customersData?.data ?? [];
    const orders = ordersData?.data ?? [];
    const bouquets = bouquetsData?.data ?? [];

    const clearFilters = () => {
        setSearch("");
        setCustomerId(undefined);
        setOrderId(undefined);
        setBouquetId(undefined);
        setRating(undefined);
        setDateFrom(undefined);
        setDateTo(undefined);
        setPage(1);
    };

    const hasActiveFilters =
        search !== "" ||
        customerId !== undefined ||
        orderId !== undefined ||
        bouquetId !== undefined ||
        rating !== undefined ||
        dateFrom !== undefined ||
        dateTo !== undefined;

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

                <div className="flex flex-wrap justify-between items-start gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="flex flex-wrap gap-3 items-end">
                        <Select
                            value={customerId?.toString() ?? "all"}
                            onValueChange={(val) =>
                                setCustomerId(
                                    val === "all" ? undefined : Number(val),
                                )
                            }
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Customer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Customers
                                </SelectItem>
                                {customers.map((customer) => (
                                    <SelectItem
                                        key={customer.id}
                                        value={customer.id.toString()}
                                    >
                                        {customer.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={orderId?.toString() ?? "all"}
                            onValueChange={(val) =>
                                setOrderId(
                                    val === "all" ? undefined : Number(val),
                                )
                            }
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Order" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Orders</SelectItem>
                                {orders.map((order) => (
                                    <SelectItem
                                        key={order.id}
                                        value={order.id.toString()}
                                    >
                                        #{order.id}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={bouquetId?.toString() ?? "all"}
                            onValueChange={(val) =>
                                setBouquetId(
                                    val === "all" ? undefined : Number(val),
                                )
                            }
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Bouquet" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Bouquets
                                </SelectItem>
                                {bouquets.map((bouquet) => (
                                    <SelectItem
                                        key={bouquet.id}
                                        value={bouquet.id.toString()}
                                    >
                                        {bouquet.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={rating?.toString() ?? "all"}
                            onValueChange={(val) =>
                                setRating(
                                    val === "all" ? undefined : Number(val),
                                )
                            }
                        >
                            <SelectTrigger className="w-28">
                                <SelectValue placeholder="Rating" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Ratings</SelectItem>
                                <SelectItem value="5">5 ★★★★★</SelectItem>
                                <SelectItem value="4">4 ★★★★</SelectItem>
                                <SelectItem value="3">3 ★★★</SelectItem>
                                <SelectItem value="2">2 ★★</SelectItem>
                                <SelectItem value="1">1 ★</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                value={dateFrom ?? ""}
                                onChange={(e) =>
                                    setDateFrom(e.target.value || undefined)
                                }
                                className="w-36"
                                placeholder="From"
                            />
                            <span className="text-muted-foreground">-</span>
                            <Input
                                type="date"
                                value={dateTo ?? ""}
                                onChange={(e) =>
                                    setDateTo(e.target.value || undefined)
                                }
                                className="w-36"
                                placeholder="To"
                            />
                        </div>
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
                    columns={feedbackColumns as ColumnDef<unknown, unknown>[]}
                    data={responses}
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
        </main>
    );
}
