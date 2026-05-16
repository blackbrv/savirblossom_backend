import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../api";

export type PromoType = {
    id: number;
    title: string;
    description: string | null;
    banner_image: string | null;
    status: "draft" | "scheduled" | "published" | "archived";
    scheduled_at: string | null;
    published_at: string | null;
    cta_label: string | null;
    cta_url: string | null;
    campaigns?: { id: number; subject: string; status: string }[];
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

export type GetPromosResponse = {
    data: PromoType[];
    links: PaginatedLinks;
    meta: PaginatedMeta;
};

type GetPromosParams = {
    page?: number;
    perPage?: number;
    search?: string;
    status?: string;
};

async function getPromos(params: GetPromosParams): Promise<GetPromosResponse> {
    const urlParams = new URLSearchParams();
    urlParams.append("page", (params.page ?? 1).toString());
    urlParams.append("per_page", (params.perPage ?? 10).toString());
    if (params.search) urlParams.append("search", params.search);
    if (params.status) urlParams.append("status", params.status);

    const response = await api<GetPromosResponse>(
        `/api/promos?${urlParams.toString()}`,
        {
            method: "GET",
            headers: { Accept: "application/json" },
        },
    );
    return response;
}

export function usePromos(params: GetPromosParams) {
    return useQuery({
        queryKey: ["promos:list", params],
        queryFn: () => getPromos(params),
    });
}

async function getPromo(id: number): Promise<{ data: PromoType }> {
    const response = await api<{ data: PromoType }>(`/api/promos/${id}`, {
        method: "GET",
        headers: { Accept: "application/json" },
    });
    return response;
}

export function usePromo(id: number) {
    return useQuery({
        queryKey: ["promos:detail", id],
        queryFn: () => getPromo(id),
        enabled: !!id,
    });
}

export type CreatePromoData = {
    title: string;
    description?: string;
    banner_image?: string;
    status?: string;
    scheduled_at?: string;
    cta_label?: string;
    cta_url?: string;
};

async function createPromo(data: CreatePromoData) {
    const response = await api<{ message: string; data: PromoType }>(
        "/api/promos/create",
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

export function useCreatePromo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPromo,
        onSuccess: () => {
            toast.success("Promo created successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({ queryKey: ["promos:list"] });
        },
        onError: () => {
            toast.error("Failed to create promo", { position: "top-center" });
        },
    });
}

export type UpdatePromoData = Partial<CreatePromoData>;

async function updatePromo(id: number, data: UpdatePromoData) {
    const response = await api<{ message: string; data: PromoType }>(
        `/api/promos/update/${id}`,
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

export function useUpdatePromo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdatePromoData }) =>
            updatePromo(id, data),
        onSuccess: () => {
            toast.success("Promo updated successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({ queryKey: ["promos:list"] });
            queryClient.invalidateQueries({ queryKey: ["promos:detail"] });
        },
        onError: () => {
            toast.error("Failed to update promo", { position: "top-center" });
        },
    });
}

async function deletePromo(id: number) {
    const response = await api<{ message: string }>(
        `/api/promos/${id}/delete`,
        {
            method: "POST",
            headers: { Accept: "application/json" },
        },
    );
    return response;
}

export function useDeletePromo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePromo,
        onSuccess: () => {
            toast.success("Promo deleted", { position: "top-center" });
            queryClient.invalidateQueries({ queryKey: ["promos:list"] });
        },
        onError: () => {
            toast.error("Failed to delete promo", { position: "top-center" });
        },
    });
}

async function publishPromo(id: number) {
    const response = await api<{ message: string; data: PromoType }>(
        `/api/promos/${id}/publish`,
        {
            method: "POST",
            headers: { Accept: "application/json" },
        },
    );
    return response;
}

export function usePublishPromo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: publishPromo,
        onSuccess: () => {
            toast.success("Promo published", { position: "top-center" });
            queryClient.invalidateQueries({ queryKey: ["promos:list"] });
            queryClient.invalidateQueries({ queryKey: ["promos:detail"] });
        },
        onError: () => {
            toast.error("Failed to publish promo", { position: "top-center" });
        },
    });
}
