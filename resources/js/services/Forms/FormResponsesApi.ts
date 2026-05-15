import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../api";
import type { PaginatedMeta } from "./FormsApi";

export type FormResponseType = {
    id: number;
    form_id: number;
    customer_id: number | null;
    submitted_at: string;
    created_at: string;
    updated_at: string;
    form?: {
        id: number;
        name: string;
    };
    customer?: {
        id: number;
        username: string;
        email: string;
    } | null;
    first_question_label?: string;
    first_answer_value?: string;
    answers?: FormAnswerType[];
};

export type FormAnswerType = {
    id: number;
    form_submission_id: number;
    form_question_id: number;
    value: string | null;
    created_at: string;
    updated_at: string;
    question?: {
        id: number;
        label: string;
        question_type: string;
    };
};

export type GetFormResponsesPaginatedResponse = {
    data: FormResponseType[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: PaginatedMeta;
};

type GetFormResponsesParams = {
    page?: number;
    perPage?: number;
};

async function GetFormResponses({
    page = 1,
    perPage = 10,
}: GetFormResponsesParams): Promise<GetFormResponsesPaginatedResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());

    const response = await api<GetFormResponsesPaginatedResponse>(
        `/api/submissions?${params.toString()}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useFormResponses({ page = 1, perPage = 10 }: GetFormResponsesParams) {
    return useQuery({
        queryKey: ["form-responses:list", page, perPage],
        queryFn: () => GetFormResponses({ page, perPage }),
    });
}

async function GetFormResponse(id: number): Promise<{ data: FormResponseType }> {
    const response = await api<{ data: FormResponseType }>(`/api/submissions/${id}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    return response;
}

export function useFormResponse(id: number) {
    return useQuery({
        queryKey: ["form-responses:detail", id],
        queryFn: () => GetFormResponse(id),
    });
}

async function deleteFormResponse(id: number) {
    const response = await api(`/api/submissions/${id}`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
        },
    });

    return response;
}

export function useDeleteFormResponse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteFormResponse(id),
        onSuccess: () => {
            toast.success("Form response deleted successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["form-responses:list"],
            });
        },
        onError: () => {
            toast.error("Failed to delete form response", {
                position: "top-center",
            });
        },
    });
}
