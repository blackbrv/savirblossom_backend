import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../api";

export type CampaignType = {
    id: number;
    promo_id: number;
    subject: string;
    email_body: string | null;
    status: "draft" | "queued" | "sending" | "sent" | "failed" | "cancelled";
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    scheduled_at: string | null;
    sent_at: string | null;
    promo?: { id: number; title: string } | null;
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

export type GetCampaignsResponse = {
    data: CampaignType[];
    links: PaginatedLinks;
    meta: PaginatedMeta;
};

type GetCampaignsParams = {
    page?: number;
    perPage?: number;
    search?: string;
    status?: string;
};

async function getCampaigns(
    params: GetCampaignsParams,
): Promise<GetCampaignsResponse> {
    const urlParams = new URLSearchParams();
    urlParams.append("page", (params.page ?? 1).toString());
    urlParams.append("per_page", (params.perPage ?? 10).toString());
    if (params.search) urlParams.append("search", params.search);
    if (params.status) urlParams.append("status", params.status);

    const response = await api<GetCampaignsResponse>(
        `/api/campaigns?${urlParams.toString()}`,
        {
            method: "GET",
            headers: { Accept: "application/json" },
        },
    );
    return response;
}

export function useCampaigns(params: GetCampaignsParams) {
    return useQuery({
        queryKey: ["campaigns:list", params],
        queryFn: () => getCampaigns(params),
    });
}

async function getCampaign(id: number): Promise<{ data: CampaignType }> {
    const response = await api<{ data: CampaignType }>(
        `/api/campaigns/${id}`,
        {
            method: "GET",
            headers: { Accept: "application/json" },
        },
    );
    return response;
}

export function useCampaign(id: number) {
    return useQuery({
        queryKey: ["campaigns:detail", id],
        queryFn: () => getCampaign(id),
        enabled: !!id,
    });
}

export type CreateCampaignData = {
    promo_id: number;
    subject: string;
    email_body?: string;
    scheduled_at?: string;
    status?: string;
};

async function createCampaign(data: CreateCampaignData) {
    const response = await api<{ message: string; data: CampaignType }>(
        "/api/campaigns/create",
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

export function useCreateCampaign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCampaign,
        onSuccess: () => {
            toast.success("Campaign created successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({ queryKey: ["campaigns:list"] });
        },
        onError: () => {
            toast.error("Failed to create campaign", {
                position: "top-center",
            });
        },
    });
}

export type UpdateCampaignData = Partial<CreateCampaignData>;

async function updateCampaign(id: number, data: UpdateCampaignData) {
    const response = await api<{ message: string; data: CampaignType }>(
        `/api/campaigns/update/${id}`,
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

export function useUpdateCampaign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCampaignData }) =>
            updateCampaign(id, data),
        onSuccess: () => {
            toast.success("Campaign updated successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({ queryKey: ["campaigns:list"] });
            queryClient.invalidateQueries({ queryKey: ["campaigns:detail"] });
        },
        onError: () => {
            toast.error("Failed to update campaign", {
                position: "top-center",
            });
        },
    });
}

async function deleteCampaign(id: number) {
    const response = await api<{ message: string }>(
        `/api/campaigns/${id}/delete`,
        {
            method: "POST",
            headers: { Accept: "application/json" },
        },
    );
    return response;
}

export function useDeleteCampaign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCampaign,
        onSuccess: () => {
            toast.success("Campaign deleted", { position: "top-center" });
            queryClient.invalidateQueries({ queryKey: ["campaigns:list"] });
        },
        onError: () => {
            toast.error("Failed to delete campaign", {
                position: "top-center",
            });
        },
    });
}

async function queueCampaign(id: number) {
    const response = await api<{ message: string; data: CampaignType }>(
        `/api/campaigns/${id}/queue`,
        {
            method: "POST",
            headers: { Accept: "application/json" },
        },
    );
    return response;
}

export function useQueueCampaign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: queueCampaign,
        onSuccess: () => {
            toast.success("Campaign queued for sending", {
                position: "top-center",
            });
            queryClient.invalidateQueries({ queryKey: ["campaigns:list"] });
            queryClient.invalidateQueries({ queryKey: ["campaigns:detail"] });
        },
        onError: () => {
            toast.error("Failed to queue campaign", {
                position: "top-center",
            });
        },
    });
}
