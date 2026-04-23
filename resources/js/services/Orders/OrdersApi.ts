import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../api";
import { CustomerType } from "../Customers/CustomersApi";

export type BouquetType = {
    id: number;
    name: string;
    price: string;
    stock: number;
    published: boolean;
    galleries?: Array<{ id: number; src: string; alt_text: string }>;
};

export type OrderItemType = {
    id: number;
    order_id: number;
    bouquet_id: number;
    quantity: number;
    unit_price: string;
    bouquet: BouquetType | null;
};

export type InvoiceType = {
    id: number;
    order_id: number;
    invoice_number: string;
    total_amount: string;
    status: "paid" | "unpaid" | "cancelled";
    paid_at: string | null;
    created_at: string;
    updated_at: string;
};

export type OrderType = {
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

export type PaginatedLinks = {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
};

export type PaginatedMeta = {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
};

export type GetOrdersPaginatedResponse = {
    data: OrderType[];
    links: PaginatedLinks;
    meta: PaginatedMeta;
};

type GetOrdersParams = {
    page?: number;
    perPage?: number;
    status?: string;
    payment_status?: "paid" | "unpaid" | "cancelled";
    search?: string;
    customer_id?: number;
    date_from?: string;
    date_to?: string;
};

async function GetOrders({
    page = 1,
    perPage = 10,
    status,
    payment_status,
    search,
    customer_id,
    date_from,
    date_to,
}: GetOrdersParams): Promise<GetOrdersPaginatedResponse> {
    const searchParams = new URLSearchParams();

    const params = {
        page,
        per_page: perPage,
        status,
        payment_status,
        search,
        customer_id,
        date_from,
        date_to,
    };

    Object.entries(params).forEach(([name, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(name, String(value));
        }
    });

    const response: GetOrdersPaginatedResponse = await api(
        `/api/orders?${searchParams.toString()}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useOrders({
    page = 1,
    perPage = 10,
    status = undefined,
    payment_status = undefined,
    search = undefined,
    customer_id = undefined,
    date_from = undefined,
    date_to = undefined,
}: GetOrdersParams = {}) {
    return useQuery({
        queryKey: [
            "orders:list",
            page,
            perPage,
            status,
            payment_status,
            search,
            customer_id,
            date_from,
            date_to,
        ],
        queryFn: () =>
            GetOrders({
                page,
                perPage,
                status,
                payment_status,
                search,
                customer_id,
                date_from,
                date_to,
            }),
    });
}

async function getOrderById(id: number): Promise<{ data: OrderType }> {
    const response = await api<{ data: OrderType }>(`/api/orders/${id}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    return response;
}

export function useOrderById({ id }: { id: number }) {
    return useQuery({
        queryKey: ["order:details", id],
        queryFn: () => getOrderById(id),
    });
}

export type OrderItemData = {
    bouquet_id: number;
    quantity: number;
};

export type CreateOrderData = {
    customer_id?: number | null;
    items: OrderItemData[];
    shipping_address: string;
    notes?: string;
    status?:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled";
};

async function createOrder(
    data: CreateOrderData,
): Promise<{ data: OrderType }> {
    const response = await api<{ data: OrderType }>(`/api/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });

    return response;
}

export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrderData) => createOrder(data),
        onSuccess: () => {
            toast.success("Order created successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({ queryKey: ["orders:list"] });
        },
        onError: () => {
            toast.error("Failed to create order", {
                position: "top-center",
            });
        },
    });
}

export type UpdateOrderData = {
    customer_id?: number | null;
    items?: OrderItemData[];
    shipping_address?: string;
    notes?: string;
    status?:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled";
};

async function updateOrder(
    id: number,
    data: UpdateOrderData,
): Promise<{ data: OrderType }> {
    const response = await api<{ data: OrderType }>(`/api/orders/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });

    return response;
}

export function useUpdateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateOrderData }) =>
            updateOrder(id, data),
        onSuccess: (_, variables) => {
            toast.success("Order updated successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({ queryKey: ["orders:list"] });
            queryClient.invalidateQueries({
                queryKey: ["order:details", variables.id],
            });
        },
        onError: () => {
            toast.error("Failed to update order", {
                position: "top-center",
            });
        },
    });
}

async function deleteOrder(id: number): Promise<{ message: string }> {
    const response = await api<{ message: string }>(`/api/orders/${id}`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
        },
    });

    return response;
}

export function useDeleteOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteOrder(id),
        onSuccess: () => {
            toast.success("Order deleted successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({ queryKey: ["orders:list"] });
        },
        onError: () => {
            toast.error("Failed to delete order", {
                position: "top-center",
            });
        },
    });
}

async function markInvoicePaid(
    orderId: number,
): Promise<{ message: string; data: InvoiceType }> {
    const response = await api<{ message: string; data: InvoiceType }>(
        `/api/orders/${orderId}/mark-paid`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useMarkInvoicePaid() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderId: number) => markInvoicePaid(orderId),
        onSuccess: ({ data }) => {
            toast.success("Invoice marked as paid", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["order:details", data.order_id],
            });
        },
        onError: () => {
            toast.error("Failed to mark invoice as paid", {
                position: "top-center",
            });
        },
    });
}
