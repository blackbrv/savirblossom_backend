import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { priceFormatter } from "@/utils/utility";
import {
    Area,
    AreaChart,
    Legend,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { DollarSign, Users, Package, X, ShoppingBag } from "lucide-react";
import {
    useDashboardStats,
    useDashboardChart,
    useOngoingOrders,
    useBouquetSales,
    ChartPeriod,
    CategorySales,
} from "@/services/Dashboard/DashboardApi";
import { ColumnDef } from "@tanstack/react-table";
import {
    useReactTable,
    flexRender,
    getCoreRowModel,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const CHART_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

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

const statusColors: Record<string, { bg: string; text: string }> = {
    pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900",
        text: "text-yellow-800 dark:text-yellow-200",
    },
    confirmed: {
        bg: "bg-blue-100 dark:bg-blue-900",
        text: "text-blue-800 dark:text-blue-200",
    },
    processing: {
        bg: "bg-purple-100 dark:bg-purple-900",
        text: "text-purple-800 dark:text-purple-200",
    },
    shipped: {
        bg: "bg-indigo-100 dark:bg-indigo-900",
        text: "text-indigo-800 dark:text-indigo-200",
    },
    delivered: {
        bg: "bg-green-100 dark:bg-green-900",
        text: "text-green-800 dark:text-green-200",
    },
    cancelled: {
        bg: "bg-red-100 dark:bg-red-900",
        text: "text-red-800 dark:text-red-200",
    },
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
            const colors = statusColors[status] || {
                bg: "bg-gray-100 dark:bg-gray-800",
                text: "text-gray-800 dark:text-gray-200",
            };
            return (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium capitalize ${colors.bg} ${colors.text}`}
                >
                    {status}
                </span>
            );
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

function StatCard({
    icon: Icon,
    title,
    value,
    isLoading,
}: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    isLoading?: boolean;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}
            </CardContent>
        </Card>
    );
}

function OrdersTable({
    columns,
    data,
    loading,
}: {
    columns: ColumnDef<OngoingOrderType>[];
    data: OngoingOrderType[];
    loading?: boolean;
}) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="overflow-hidden rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext(),
                                          )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                Loading...
                            </TableCell>
                        </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No orders found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function CategoryProductsPanel({
    category,
    isOpen,
    onClose,
}: {
    category: CategorySales | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-[400px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        {category?.category_name}
                    </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6 p-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-muted p-4">
                            <p className="text-sm text-muted-foreground">
                                Total Sold
                            </p>
                            <p className="text-2xl font-bold">
                                {category?.total_quantity.toLocaleString() ?? 0}
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted p-4">
                            <p className="text-sm text-muted-foreground">
                                Total Revenue
                            </p>
                            <p className="text-2xl font-bold">
                                {priceFormatter(category?.total_revenue ?? 0)}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">
                            Top 5 Best Selling Products
                        </h3>
                        <div className="space-y-2">
                            {category?.top_products.map((product, index) => (
                                <div
                                    key={product.name}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                                            style={{
                                                backgroundColor:
                                                    CHART_COLORS[
                                                        index %
                                                            CHART_COLORS.length
                                                    ],
                                                color: "white",
                                            }}
                                        >
                                            {index + 1}
                                        </div>
                                        <span className="font-medium">
                                            {product.name}
                                        </span>
                                    </div>
                                    <span className="text-muted-foreground">
                                        {product.quantity} sold
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

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

    const CustomTooltip = ({
        active,
        payload,
    }: {
        active?: boolean;
        payload?: Array<{ payload: CategorySales }>;
    }) => {
        if (active && payload && payload.length > 0) {
            const data = payload[0]?.payload;
            if (!data) return null;

            const topProductsList = data.top_products
                .slice(0, 5)
                .map((p) => `${p.name}: ${p.quantity}`)
                .join(", ");

            return (
                <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <p className="font-semibold">{data.category_name}</p>
                    <p className="text-sm text-muted-foreground">
                        Total: {data.total_quantity.toLocaleString()} sold
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 border-t pt-1">
                        Top 5: {topProductsList}
                    </p>
                </div>
            );
        }
        return null;
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
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Revenue Overview</CardTitle>
                            <Select
                                value={chartPeriod}
                                onValueChange={(value) =>
                                    setChartPeriod(value as ChartPeriod)
                                }
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">
                                        Monthly
                                    </SelectItem>
                                    <SelectItem value="weekly">
                                        Weekly
                                    </SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            {chartLoading ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <span className="text-muted-foreground">
                                        Loading chart...
                                    </span>
                                </div>
                            ) : chartData?.data && chartData.data.length > 0 ? (
                                <ChartContainer
                                    config={{
                                        revenue: {
                                            label: "Revenue",
                                            color: "hsl(var(--chart-1))",
                                        },
                                    }}
                                    className="h-[300px] w-full"
                                >
                                    <AreaChart
                                        data={chartData.data}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: 0,
                                            bottom: 0,
                                        }}
                                    >
                                        <XAxis
                                            dataKey="period"
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) =>
                                                value >= 1000000
                                                    ? `${(value / 1000000).toFixed(1)}M`
                                                    : value >= 1000
                                                      ? `${(value / 1000).toFixed(0)}K`
                                                      : value
                                            }
                                        />
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    formatter={(value) => [
                                                        priceFormatter(
                                                            Number(value),
                                                        ),
                                                        "Revenue",
                                                    ]}
                                                />
                                            }
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="hsl(var(--chart-1))"
                                            fill="hsl(var(--chart-1))"
                                            fillOpacity={0.3}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center">
                                    <span className="text-muted-foreground">
                                        No data available
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sales by Category</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Click on a category to see top selling products
                            </p>
                        </CardHeader>
                        <CardContent>
                            {bouquetSalesLoading ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <span className="text-muted-foreground">
                                        Loading chart...
                                    </span>
                                </div>
                            ) : bouquetSales?.data &&
                              bouquetSales.data.length > 0 ? (
                                <div className="h-[300px]">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={bouquetSales.data}
                                                dataKey="total_quantity"
                                                nameKey="category_name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                innerRadius={50}
                                                paddingAngle={2}
                                                onClick={(_, index) => {
                                                    const item =
                                                        bouquetSales.data[
                                                            index
                                                        ];
                                                    if (item)
                                                        handlePieClick(item);
                                                }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                {bouquetSales.data.map(
                                                    (_, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={
                                                                CHART_COLORS[
                                                                    index %
                                                                        CHART_COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </Pie>
                                            <Tooltip
                                                content={<CustomTooltip />}
                                            />
                                            <Legend
                                                formatter={(value) => (
                                                    <span className="text-sm">
                                                        {value}
                                                    </span>
                                                )}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center">
                                    <span className="text-muted-foreground">
                                        No data available
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
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
                                <SelectTrigger className="w-[140px]">
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
                                <SelectTrigger className="w-[100px]">
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

                        {ordersData && ordersData.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {ordersData.from} to {ordersData.to}{" "}
                                    of {ordersData.total} results
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

                                        {ordersData.links
                                            .filter(
                                                (link) =>
                                                    link.label !== "..." &&
                                                    !isNaN(Number(link.label)),
                                            )
                                            .map((link, index) => (
                                                <PaginationItem key={index}>
                                                    <PaginationLink
                                                        onClick={() =>
                                                            handlePageChange(
                                                                Number(
                                                                    link.label,
                                                                ),
                                                            )
                                                        }
                                                        isActive={link.active}
                                                        className="cursor-pointer"
                                                    >
                                                        {link.label}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() =>
                                                    handlePageChange(
                                                        Math.min(
                                                            ordersData.last_page,
                                                            orderPage + 1,
                                                        ),
                                                    )
                                                }
                                                className={
                                                    orderPage ===
                                                    ordersData.last_page
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
