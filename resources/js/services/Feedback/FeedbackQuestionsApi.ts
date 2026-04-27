import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../api";

export type FeedbackQuestionType = {
    id: number;
    feedback_questions_template_id: number;
    question_text: string;
    question_type: "star_rating" | "text" | "yes_no" | "yes_no_reason";
    is_required: boolean;
    order: number;
    created_at: string;
    updated_at: string;
};

export type FeedbackQuestionsTemplateType = {
    id: number;
    name: string;
    description: string | null;
    is_default: boolean;
    is_active: boolean;
    questions_count?: number;
    questions?: FeedbackQuestionType[];
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

export type GetFeedbackTemplatesPaginatedResponse = {
    data: FeedbackQuestionsTemplateType[];
    links: PaginatedLinks;
    meta: PaginatedMeta;
};

type GetFeedbackTemplatesParams = {
    page?: number;
    perPage?: number;
    search?: string;
};

async function GetFeedbackTemplates({
    page = 1,
    perPage = 10,
    search,
}: GetFeedbackTemplatesParams): Promise<GetFeedbackTemplatesPaginatedResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());
    if (search) {
        params.append("search", search);
    }

    const response = await api<GetFeedbackTemplatesPaginatedResponse>(
        `/api/feedback-questions-templates?${params.toString()}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useFeedbackTemplates({
    page = 1,
    perPage = 10,
    search,
}: GetFeedbackTemplatesParams) {
    return useQuery({
        queryKey: ["feedback-templates:list", page, perPage, search],
        queryFn: () => GetFeedbackTemplates({ page, perPage, search }),
    });
}

async function GetFeedbackTemplate(
    id: number,
): Promise<{ data: FeedbackQuestionsTemplateType }> {
    const response = await api<{ data: FeedbackQuestionsTemplateType }>(
        `/api/feedback-questions-templates/${id}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useFeedbackTemplate(id: number) {
    return useQuery({
        queryKey: ["feedback-templates:detail", id],
        queryFn: () => GetFeedbackTemplate(id),
    });
}

type CreateTemplateData = {
    name: string;
    description?: string;
    is_default?: boolean;
    is_active?: boolean;
};

async function createTemplate(
    data: CreateTemplateData,
): Promise<{ data: FeedbackQuestionsTemplateType }> {
    const response = await api<{ data: FeedbackQuestionsTemplateType }>(
        "/api/feedback-questions-templates",
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

export function useCreateFeedbackTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTemplateData) => createTemplate(data),
        onSuccess: () => {
            toast.success("Template created successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["feedback-templates:list"],
            });
        },
        onError: () => {
            toast.error("Failed to create template", {
                position: "top-center",
            });
        },
    });
}

type UpdateTemplateData = {
    name?: string;
    description?: string;
    is_default?: boolean;
    is_active?: boolean;
};

async function updateTemplate(
    id: number,
    data: UpdateTemplateData,
): Promise<{ data: FeedbackQuestionsTemplateType }> {
    const response = await api<{ data: FeedbackQuestionsTemplateType }>(
        `/api/feedback-questions-templates/${id}`,
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

export function useUpdateFeedbackTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTemplateData }) =>
            updateTemplate(id, data),
        onSuccess: (_, variables) => {
            toast.success("Template updated successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["feedback-templates:list"],
            });
            queryClient.invalidateQueries({
                queryKey: ["feedback-templates:detail", variables.id],
            });
        },
        onError: () => {
            toast.error("Failed to update template", {
                position: "top-center",
            });
        },
    });
}

async function deleteTemplate(id: number) {
    const response = await api(`/api/feedback-questions-templates/${id}`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
        },
    });

    return response;
}

export function useDeleteFeedbackTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteTemplate(id),
        onSuccess: () => {
            toast.success("Template deleted successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["feedback-templates:list"],
            });
        },
        onError: () => {
            toast.error("Failed to delete template", {
                position: "top-center",
            });
        },
    });
}

type CreateQuestionData = {
    question_text: string;
    question_type: "star_rating" | "text" | "yes_no" | "yes_no_reason";
    is_required?: boolean;
    order?: number;
};

async function addQuestion(
    templateId: number,
    data: CreateQuestionData,
): Promise<{ data: FeedbackQuestionType }> {
    const response = await api<{ data: FeedbackQuestionType }>(
        `/api/feedback-questions-templates/${templateId}/questions`,
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

export function useAddFeedbackQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            templateId,
            data,
        }: {
            templateId: number;
            data: CreateQuestionData;
        }) => addQuestion(templateId, data),
        onSuccess: (_, variables) => {
            toast.success("Question added successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["feedback-templates:detail", variables.templateId],
            });
        },
        onError: () => {
            toast.error("Failed to add question", {
                position: "top-center",
            });
        },
    });
}

type UpdateQuestionData = {
    question_text?: string;
    question_type?: "star_rating" | "text" | "yes_no" | "yes_no_reason";
    is_required?: boolean;
    order?: number;
};

async function updateQuestion(
    templateId: number,
    questionId: number,
    data: UpdateQuestionData,
): Promise<{ data: FeedbackQuestionType }> {
    const response = await api<{ data: FeedbackQuestionType }>(
        `/api/feedback-questions-templates/${templateId}/questions/${questionId}`,
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

export function useUpdateFeedbackQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            templateId,
            questionId,
            data,
        }: {
            templateId: number;
            questionId: number;
            data: UpdateQuestionData;
        }) => updateQuestion(templateId, questionId, data),
        onSuccess: (_, variables) => {
            toast.success("Question updated successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["feedback-templates:detail", variables.templateId],
            });
        },
        onError: () => {
            toast.error("Failed to update question", {
                position: "top-center",
            });
        },
    });
}

async function deleteQuestion(templateId: number, questionId: number) {
    const response = await api(
        `/api/feedback-questions-templates/${templateId}/questions/${questionId}`,
        {
            method: "DELETE",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useDeleteFeedbackQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            templateId,
            questionId,
        }: {
            templateId: number;
            questionId: number;
        }) => deleteQuestion(templateId, questionId),
        onSuccess: (_, variables) => {
            toast.success("Question deleted successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["feedback-templates:detail", variables.templateId],
            });
        },
        onError: () => {
            toast.error("Failed to delete question", {
                position: "top-center",
            });
        },
    });
}

async function reorderQuestions(
    templateId: number,
    order: number[],
): Promise<{ data: FeedbackQuestionsTemplateType }> {
    const response = await api<{ data: FeedbackQuestionsTemplateType }>(
        `/api/feedback-questions-templates/${templateId}/questions/reorder`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ order }),
        },
    );

    return response;
}

export function useReorderFeedbackQuestions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            templateId,
            order,
        }: {
            templateId: number;
            order: number[];
        }) => reorderQuestions(templateId, order),
        onSuccess: (_, variables) => {
            toast.success("Questions reordered successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["feedback-templates:detail", variables.templateId],
            });
        },
        onError: () => {
            toast.error("Failed to reorder questions", {
                position: "top-center",
            });
        },
    });
}
