import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../api";

export type FeedbackAnswerType = {
    id: number;
    feedback_response_id: number;
    feedback_question_id: number;
    rating_value: number | null;
    text_value: string | null;
    boolean_value: boolean | null;
    reason_value: string | null;
    question?: FeedbackQuestionType;
};

export type FeedbackQuestionType = {
    id: number;
    question_text: string;
    question_type: "star_rating" | "text" | "yes_no" | "yes_no_reason";
    is_required: boolean;
    order: number;
};

export type FeedbackResponseType = {
    id: number;
    customer_id: number | null;
    order_id: number | null;
    bouquet_id: number | null;
    average_rating: number | null;
    customer?: {
        id: number;
        username: string;
        email: string;
    };
    order?: {
        id: number;
        created_at: string;
    };
    bouquet?: {
        id: number;
        name: string;
    };
    answers: FeedbackAnswerType[];
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

export type GetFeedbackResponsesPaginatedResponse = {
    data: FeedbackResponseType[];
    links: PaginatedLinks;
    meta: PaginatedMeta;
};

type GetFeedbackResponsesParams = {
    page?: number;
    perPage?: number;
    order_id?: number;
    bouquet_id?: number;
    customer_id?: number;
    rating?: number;
    date_from?: string;
    date_to?: string;
    search?: string;
};

async function GetFeedbackResponses({
    page = 1,
    perPage = 10,
    order_id,
    bouquet_id,
    customer_id,
    rating,
    date_from,
    date_to,
    search,
}: GetFeedbackResponsesParams): Promise<GetFeedbackResponsesPaginatedResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());
    if (order_id) params.append("order_id", order_id.toString());
    if (bouquet_id) params.append("bouquet_id", bouquet_id.toString());
    if (customer_id) params.append("customer_id", customer_id.toString());
    if (rating) params.append("rating", rating.toString());
    if (date_from) params.append("date_from", date_from);
    if (date_to) params.append("date_to", date_to);
    if (search) params.append("search", search);

    const response = await api<GetFeedbackResponsesPaginatedResponse>(
        `/api/feedback?${params.toString()}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useFeedbackResponses({
    page = 1,
    perPage = 10,
    order_id,
    bouquet_id,
    customer_id,
    rating,
    date_from,
    date_to,
    search,
}: GetFeedbackResponsesParams) {
    return useQuery({
        queryKey: [
            "feedback:list",
            page,
            perPage,
            order_id,
            bouquet_id,
            customer_id,
            rating,
            date_from,
            date_to,
            search,
        ],
        queryFn: () =>
            GetFeedbackResponses({
                page,
                perPage,
                order_id,
                bouquet_id,
                customer_id,
                rating,
                date_from,
                date_to,
                search,
            }),
    });
}

async function GetFeedbackResponse(
    id: number,
): Promise<{ data: FeedbackResponseType }> {
    const response = await api<{ data: FeedbackResponseType }>(
        `/api/feedback/${id}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useFeedbackResponse(id: number) {
    return useQuery({
        queryKey: ["feedback:detail", id],
        queryFn: () => GetFeedbackResponse(id),
    });
}

type SubmitFeedbackData = {
    customer_id?: number;
    order_id?: number;
    bouquet_id?: number;
    answers: Array<{
        question_id: number;
        rating_value?: number;
        text_value?: string;
        boolean_value?: boolean;
        reason_value?: string;
    }>;
};

async function submitFeedback(
    data: SubmitFeedbackData,
): Promise<{ data: FeedbackResponseType }> {
    const response = await api<{ data: FeedbackResponseType }>(
        "/api/feedback",
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

export function useSubmitFeedback() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SubmitFeedbackData) => submitFeedback(data),
        onSuccess: () => {
            toast.success("Feedback submitted successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({ queryKey: ["feedback:list"] });
        },
        onError: (error) => {
            toast.error("Failed to submit feedback", {
                position: "top-center",
            });
            console.error(error);
        },
    });
}

async function deleteFeedback(id: number) {
    const response = await api(`/api/feedback/${id}`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
        },
    });

    return response;
}

export function useDeleteFeedback() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteFeedback(id),
        onSuccess: () => {
            toast.success("Feedback deleted successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({ queryKey: ["feedback:list"] });
        },
        onError: () => {
            toast.error("Failed to delete feedback", {
                position: "top-center",
            });
        },
    });
}

type UpdateFeedbackData = {
    answers: Array<{
        id: number;
        rating_value?: number;
        text_value?: string;
        boolean_value?: boolean;
        reason_value?: string;
    }>;
};

async function updateFeedback(
    id: number,
    data: UpdateFeedbackData,
): Promise<{ data: FeedbackResponseType }> {
    const response = await api<{ data: FeedbackResponseType }>(
        `/api/feedback/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(data),
        },
    );

    return response;
}

export function useUpdateFeedback() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateFeedbackData }) =>
            updateFeedback(id, data),
        onSuccess: (result) => {
            toast.success("Feedback updated successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({ queryKey: ["feedback:list"] });
            queryClient.setQueryData(["feedback:detail", result?.data?.id], result);
        },
        onError: (error) => {
            toast.error("Failed to update feedback", {
                position: "top-center",
            });
            console.error(error);
        },
    });
}
