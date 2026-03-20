import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { CustomerType } from "../Customers/CustomersApi";
import { BouquetType, InvoiceType, OrderItemType } from "../Orders/OrdersApi";

export type DashboardStats = {
    total_bouquets_sold: number;
    total_revenue: number;
    total_customers: number;
};

export type ChartDataPoint = {
    period: string;
    revenue: number;
    orders: number;
};

export type ChartResponse = {
    data: ChartDataPoint[];
};

export type OngoingOrderType = {
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
    shipping_address: string;
    notes: string | null;
    items: OrderItemType[];
    customer: CustomerType | null;
    invoice: InvoiceType | null;
    created_at: string;
    updated_at: string;
};

export type OngoingOrdersResponse = {
    current_page: number;
    data: OngoingOrderType[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        page: number | null;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

async function getDashboardStats(): Promise<DashboardStats> {
    const response = await api<DashboardStats>("/api/dashboard/stats", {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    return response;
}

export function useDashboardStats() {
    return useQuery({
        queryKey: ["dashboard:stats"],
        queryFn: getDashboardStats,
    });
}

export type ChartPeriod = "monthly" | "weekly" | "daily";

async function getDashboardChart(
    period: ChartPeriod = "monthly",
): Promise<ChartResponse> {
    const response = await api<ChartResponse>(
        `/api/dashboard/chart?period=${period}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useDashboardChart(period: ChartPeriod = "monthly") {
    return useQuery({
        queryKey: ["dashboard:chart", period],
        queryFn: () => getDashboardChart(period),
    });
}

type OngoingOrdersParams = {
    page?: number;
    perPage?: number;
    status?: string;
};

async function getOngoingOrders({
    page = 1,
    perPage = 10,
    status = "pending",
}: OngoingOrdersParams): Promise<OngoingOrdersResponse> {
    const searchParams = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
        status,
    });

    const response = await api<OngoingOrdersResponse>(
        `/api/dashboard/ongoing-orders?${searchParams.toString()}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useOngoingOrders({
    page = 1,
    perPage = 10,
    status = "pending",
}: OngoingOrdersParams = {}) {
    return useQuery({
        queryKey: ["dashboard:ongoing-orders", page, perPage, status],
        queryFn: () => getOngoingOrders({ page, perPage, status }),
    });
}

export type TopProduct = {
    name: string;
    quantity: number;
};

export type CategorySales = {
    category_id: number;
    category_name: string;
    total_quantity: number;
    total_revenue: number;
    top_products: TopProduct[];
};

export type BouquetSalesResponse = {
    data: CategorySales[];
};

async function getBouquetSales(): Promise<BouquetSalesResponse> {
    const response = await api<BouquetSalesResponse>(
        "/api/dashboard/bouquet-sales",
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useBouquetSales() {
    return useQuery({
        queryKey: ["dashboard:bouquet-sales"],
        queryFn: getBouquetSales,
    });
}
