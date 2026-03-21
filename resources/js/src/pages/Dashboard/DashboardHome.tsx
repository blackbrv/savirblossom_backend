import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DollarSign, Users, Package } from "lucide-react";
import {
    useDashboardStats,
    useDashboardChart,
    useOngoingOrders,
    useBouquetSales,
    ChartPeriod,
    CategorySales,
} from "@/services/Dashboard/DashboardApi";
import { ColumnDef } from "@tanstack/react-table";
import { priceFormatter } from "@/utils/utility";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import {
    StatCard,
    OrdersTable,
    CategoryProductsPanel,
    RevenueChart,
    CategoryPieChart,
} from "./components";

type OngoingOrderType = {
    id: number;
    customer_id: number | null;
    status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled";
    total: string;
    items: Array<{ quantity: number }>;
    customer: { username: string } | null;
    created_at: string;
};

const ongoingOrderColumns: ColumnDef<OngoingOrderType>[] = [
    {
        accessorKey: "id",
        header: "Order ID",
    },
    {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => {
            const customer = row.original.customer;
            return customer ? (
                customer.username
            ) : (
                <span className="text-muted-foreground italic">Guest</span>
            );
        },
    },
    {
        accessorKey: "items",
        header: "Items",
        cell: ({ getValue }) => {
            const items = getValue() as Array<{ quantity: number }>;
            const totalQty = items.reduce(
                (sum, item) => sum + item.quantity,
                0,
            );
            return totalQty;
        },
    },
    {
        accessorKey: "total",
        header: "Total",
        cell: ({ getValue }) => {
            const value = getValue() as string;
            return priceFormatter(parseInt(value));
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
            const status = getValue() as OngoingOrderType["status"];
            return <StatusBadge status={status} />;
        },
    },
    {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ getValue }) => {
            const value = getValue() as string;
            return new Date(value).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        },
    },
];

export default function DashboardHome() {
    const [chartPeriod, setChartPeriod] =
        React.useState<ChartPeriod>("monthly");
    const [orderPage, setOrderPage] = React.useState(1);
    const [orderPerPage, setOrderPerPage] = React.useState(10);
    const [orderStatus, setOrderStatus] = React.useState("pending");
    const [selectedCategory, setSelectedCategory] =
        React.useState<CategorySales | null>(null);
    const [isPanelOpen, setIsPanelOpen] = React.useState(false);

    const { data: stats, isLoading: statsLoading } = useDashboardStats();
    const { data: chartData, isLoading: chartLoading } =
        useDashboardChart(chartPeriod);
    const { data: bouquetSales, isLoading: bouquetSalesLoading } =
        useBouquetSales();
    const { data: ordersData, isLoading: ordersLoading } = useOngoingOrders({
        page: orderPage,
        perPage: orderPerPage,
        status: orderStatus,
    });

    const handlePageChange = (page: number) => {
        setOrderPage(page);
    };

    const handlePerPageChange = (value: string) => {
        setOrderPerPage(Number(value));
        setOrderPage(1);
    };

    const handleStatusChange = (value: string) => {
        setOrderStatus(value);
        setOrderPage(1);
    };

    const handlePieClick = (data: CategorySales) => {
        setSelectedCategory(data);
        setIsPanelOpen(true);
    };

    return (
        <main className="min-h-screen">
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard
                        icon={Package}
                        title="Total Bouquets Sold"
                        value={
                            stats?.total_bouquets_sold?.toLocaleString() ?? "0"
                        }
                        isLoading={statsLoading}
                    />
                    <StatCard
                        icon={DollarSign}
                        title="Total Revenue"
                        value={priceFormatter(stats?.total_revenue ?? 0)}
                        isLoading={statsLoading}
                    />
                    <StatCard
                        icon={Users}
                        title="Total Customers"
                        value={stats?.total_customers?.toLocaleString() ?? "0"}
                        isLoading={statsLoading}
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <RevenueChart
                        data={chartData?.data ?? []}
                        isLoading={chartLoading}
                        period={chartPeriod}
                        onPeriodChange={(p) => setChartPeriod(p as ChartPeriod)}
                    />

                    <CategoryPieChart
                        data={bouquetSales?.data ?? []}
                        isLoading={bouquetSalesLoading}
                        onCategoryClick={handlePieClick}
                    />
                </div>

                <CategoryProductsPanel
                    category={selectedCategory}
                    isOpen={isPanelOpen}
                    onClose={() => setIsPanelOpen(false)}
                />

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Ongoing Orders</CardTitle>
                        <div className="flex items-center gap-2">
                            <Select
                                value={orderStatus}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="w-35">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
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
                                </SelectContent>
                            </Select>
                            <Select
                                value={String(orderPerPage)}
                                onValueChange={handlePerPageChange}
                            >
                                <SelectTrigger className="w-25">
                                    <SelectValue placeholder="Per page" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 / page</SelectItem>
                                    <SelectItem value="10">
                                        10 / page
                                    </SelectItem>
                                    <SelectItem value="20">
                                        20 / page
                                    </SelectItem>
                                    <SelectItem value="50">
                                        50 / page
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <OrdersTable
                            columns={ongoingOrderColumns}
                            data={ordersData?.data ?? []}
                            loading={ordersLoading}
                        />

                        {ordersData && ordersData.meta.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {ordersData.meta.from} to{" "}
                                    {ordersData.meta.to} of{" "}
                                    {ordersData.meta.total} results
                                </p>
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() =>
                                                    handlePageChange(
                                                        Math.max(
                                                            1,
                                                            orderPage - 1,
                                                        ),
                                                    )
                                                }
                                                className={
                                                    orderPage === 1
                                                        ? "pointer-events-none opacity-50"
                                                        : "cursor-pointer"
                                                }
                                            />
                                        </PaginationItem>

                                        {Array.from(
                                            {
                                                length: ordersData.meta
                                                    .last_page,
                                            },
                                            (_, i) => i + 1,
                                        ).map((pageNum) => (
                                            <PaginationItem key={pageNum}>
                                                <PaginationLink
                                                    onClick={() =>
                                                        handlePageChange(
                                                            pageNum,
                                                        )
                                                    }
                                                    isActive={
                                                        pageNum ===
                                                        ordersData.meta
                                                            .current_page
                                                    }
                                                    className="cursor-pointer"
                                                >
                                                    {pageNum}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() =>
                                                    handlePageChange(
                                                        Math.min(
                                                            ordersData.meta
                                                                .last_page,
                                                            orderPage + 1,
                                                        ),
                                                    )
                                                }
                                                className={
                                                    orderPage ===
                                                    ordersData.meta.last_page
                                                        ? "pointer-events-none opacity-50"
                                                        : "cursor-pointer"
                                                }
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
