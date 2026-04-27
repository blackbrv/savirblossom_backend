import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../api";

export type CouponType = {
    id: number;
    code: string;
    name: string;
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    min_order_value: number | null;
    usage_limit: number | null;
    usage_count: number;
    max_uses_per_user: number | null;
    valid_from: string | null;
    valid_until: string | null;
    is_active: boolean;
    is_stackable: boolean;
    priority: number;
    bouquets: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    created_at: string;
    updated_at: string;
};

export type CouponResponse = {
    data: CouponType[];
};

export type CouponDetailResponse = {
    data: CouponType;
};

async function getCoupons(): Promise<CouponResponse> {
    const response = await api<CouponResponse>("/api/coupons", {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    return response;
}

export function useCoupons() {
    return useQuery({
        queryKey: ["coupons"],
        queryFn: getCoupons,
    });
}

async function getCoupon(id: number): Promise<CouponDetailResponse> {
    const response = await api<CouponDetailResponse>(`/api/coupons/${id}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    return response;
}

export function useCoupon(id: number) {
    return useQuery({
        queryKey: ["coupons", id],
        queryFn: () => getCoupon(id),
        enabled: !!id,
    });
}

export type CreateCouponData = {
    code: string;
    name: string;
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    min_order_value?: number;
    usage_limit?: number;
    max_uses_per_user?: number;
    valid_from?: string;
    valid_until?: string;
    is_active?: boolean;
    is_stackable?: boolean;
    priority?: number;
    bouquet_ids?: number[];
    category_ids?: number[];
};

async function createCoupon(data: CreateCouponData) {
    const response = await api<{ message: string; data: CouponType }>(
        "/api/coupons/create",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(data),
        },
    );

    return response;
}

export function useCreateCoupon() {
    return useMutation({
        mutationFn: createCoupon,
    });
}

export type UpdateCouponData = Partial<CreateCouponData>;

async function updateCoupon(id: number, data: UpdateCouponData) {
    const response = await api<{ message: string; data: CouponType }>(
        `/api/coupons/update/${id}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(data),
        },
    );

    return response;
}

export function useUpdateCoupon() {
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCouponData }) =>
            updateCoupon(id, data),
    });
}

async function deleteCoupon(id: number) {
    const response = await api<{ message: string }>(`/api/coupons/${id}/delete`, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
    });

    return response;
}

export function useDeleteCoupon() {
    return useMutation({
        mutationFn: deleteCoupon,
    });
}

async function toggleCoupon(id: number) {
    const response = await api<{ message: string; data: CouponType }>(
        `/api/coupons/${id}/toggle`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useToggleCoupon() {
    return useMutation({
        mutationFn: toggleCoupon,
    });
}

export type ValidateCouponResponse = {
    valid: boolean;
    coupon: {
        id: number;
        code: string;
        name: string;
        discount_type: "percentage" | "fixed_amount";
        discount_value: number;
    };
    discount: number;
};

async function validateCoupon(code: string) {
    const response = await api<ValidateCouponResponse>("/api/coupons/validate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ code }),
    });

    return response;
}

export function useValidateCoupon() {
    return useMutation({
        mutationFn: validateCoupon,
    });
}