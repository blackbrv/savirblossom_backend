import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../api";
import type { SubscriberType } from "./NewsletterApi";

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

export type GetSubscribersResponse = {
    data: SubscriberType[];
    links: PaginatedLinks;
    meta: PaginatedMeta;
};

type GetSubscribersParams = {
    page?: number;
    perPage?: number;
    search?: string;
    status?: string;
};

async function getSubscribers({
    page = 1,
    perPage = 10,
    search,
    status,
}: GetSubscribersParams): Promise<GetSubscribersResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());
    if (search) params.append("search", search);
    if (status) params.append("status", status);

    const response = await api<GetSubscribersResponse>(
        `/api/newsletter/subscribers?${params.toString()}`,
        {
            method: "GET",
            headers: { Accept: "application/json" },
        },
    );
    return response;
}

export function useSubscribers(params: GetSubscribersParams) {
    return useQuery({
        queryKey: ["subscribers:list", params],
        queryFn: () => getSubscribers(params),
    });
}

async function getSubscriber(id: number): Promise<{ data: SubscriberType }> {
    const response = await api<{ data: SubscriberType }>(
        `/api/newsletter/subscribers/${id}`,
        {
            method: "GET",
            headers: { Accept: "application/json" },
        },
    );
    return response;
}

export function useSubscriber(id: number) {
    return useQuery({
        queryKey: ["subscribers:detail", id],
        queryFn: () => getSubscriber(id),
        enabled: !!id,
    });
}

async function toggleSubscriber(id: number) {
    const response = await api<{ message: string; data: SubscriberType }>(
        `/api/newsletter/subscribers/${id}/toggle`,
        {
            method: "POST",
            headers: { Accept: "application/json" },
        },
    );
    return response;
}

export function useToggleSubscriber() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: toggleSubscriber,
        onSuccess: () => {
            toast.success("Subscriber status updated", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["subscribers:list"],
            });
        },
        onError: () => {
            toast.error("Failed to update subscriber", {
                position: "top-center",
            });
        },
    });
}

async function deleteSubscriber(id: number) {
    const response = await api<{ message: string }>(
        `/api/newsletter/subscribers/${id}`,
        {
            method: "DELETE",
            headers: { Accept: "application/json" },
        },
    );
    return response;
}

export function useDeleteSubscriber() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteSubscriber,
        onSuccess: () => {
            toast.success("Subscriber deleted", { position: "top-center" });
            queryClient.invalidateQueries({
                queryKey: ["subscribers:list"],
            });
        },
        onError: () => {
            toast.error("Failed to delete subscriber", {
                position: "top-center",
            });
        },
    });
}
