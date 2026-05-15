import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../api";

export type FormQuestionOptionType = {
    id: number;
    form_question_id: number;
    label: string;
    value: string | null;
    order: number;
    created_at: string;
    updated_at: string;
};

export type FormQuestionType = {
    id: number;
    form_id: number;
    label: string;
    question_type: string;
    is_required: boolean;
    order: number;
    config: Record<string, unknown> | null;
    options: FormQuestionOptionType[];
    created_at: string;
    updated_at: string;
};

export type FormType = {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    questions_count?: number;
    questions?: FormQuestionType[];
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

export type GetFormsPaginatedResponse = {
    data: FormType[];
    links: PaginatedLinks;
    meta: PaginatedMeta;
};

type GetFormsParams = {
    page?: number;
    perPage?: number;
    search?: string;
};

async function GetForms({
    page = 1,
    perPage = 10,
    search,
}: GetFormsParams): Promise<GetFormsPaginatedResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());
    if (search) {
        params.append("search", search);
    }

    const response = await api<GetFormsPaginatedResponse>(
        `/api/forms?${params.toString()}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useForms({ page = 1, perPage = 10, search }: GetFormsParams) {
    return useQuery({
        queryKey: ["forms:list", page, perPage, search],
        queryFn: () => GetForms({ page, perPage, search }),
    });
}

async function GetForm(id: number): Promise<{ data: FormType }> {
    const response = await api<{ data: FormType }>(`/api/forms/${id}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    return response;
}

export function useForm(id: number) {
    return useQuery({
        queryKey: ["forms:detail", id],
        queryFn: () => GetForm(id),
    });
}

type CreateFormData = {
    name: string;
    description?: string;
    is_active?: boolean;
};

async function createForm(data: CreateFormData): Promise<{ data: FormType }> {
    const response = await api<{ data: FormType }>("/api/forms", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });

    return response;
}

export function useCreateForm() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateFormData) => createForm(data),
        onSuccess: () => {
            toast.success("Form created successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["forms:list"],
            });
        },
        onError: () => {
            toast.error("Failed to create form", {
                position: "top-center",
            });
        },
    });
}

type UpdateFormData = {
    name?: string;
    description?: string;
    is_active?: boolean;
};

async function updateForm(
    id: number,
    data: UpdateFormData,
): Promise<{ data: FormType }> {
    const response = await api<{ data: FormType }>(`/api/forms/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });

    return response;
}

export function useUpdateForm() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateFormData }) =>
            updateForm(id, data),
        onSuccess: (_, variables) => {
            toast.success("Form updated successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["forms:list"],
            });
            queryClient.invalidateQueries({
                queryKey: ["forms:detail", variables.id],
            });
        },
        onError: () => {
            toast.error("Failed to update form", {
                position: "top-center",
            });
        },
    });
}

async function deleteForm(id: number) {
    const response = await api(`/api/forms/${id}`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
        },
    });

    return response;
}

export function useDeleteForm() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteForm(id),
        onSuccess: () => {
            toast.success("Form deleted successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["forms:list"],
            });
        },
        onError: () => {
            toast.error("Failed to delete form", {
                position: "top-center",
            });
        },
    });
}

type CreateQuestionData = {
    label: string;
    question_type: string;
    is_required?: boolean;
    order?: number;
    config?: Record<string, unknown>;
    options?: { label: string; value?: string }[];
};

async function addQuestion(
    formId: number,
    data: CreateQuestionData,
): Promise<{ data: FormQuestionType }> {
    const response = await api<{ data: FormQuestionType }>(
        `/api/forms/${formId}/questions`,
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

export function useAddFormQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            formId,
            data,
        }: {
            formId: number;
            data: CreateQuestionData;
        }) => addQuestion(formId, data),
        onSuccess: (_, variables) => {
            toast.success("Question added successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["forms:detail", variables.formId],
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
    label?: string;
    question_type?: string;
    is_required?: boolean;
    order?: number;
    config?: Record<string, unknown>;
    options?: { label: string; value?: string }[];
};

async function updateQuestion(
    formId: number,
    questionId: number,
    data: UpdateQuestionData,
): Promise<{ data: FormQuestionType }> {
    const response = await api<{ data: FormQuestionType }>(
        `/api/forms/${formId}/questions/${questionId}`,
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

export function useUpdateFormQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            formId,
            questionId,
            data,
        }: {
            formId: number;
            questionId: number;
            data: UpdateQuestionData;
        }) => updateQuestion(formId, questionId, data),
        onSuccess: (_, variables) => {
            toast.success("Question updated successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["forms:detail", variables.formId],
            });
        },
        onError: () => {
            toast.error("Failed to update question", {
                position: "top-center",
            });
        },
    });
}

async function deleteQuestion(formId: number, questionId: number) {
    const response = await api(`/api/forms/${formId}/questions/${questionId}`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
        },
    });

    return response;
}

export function useDeleteFormQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            formId,
            questionId,
        }: {
            formId: number;
            questionId: number;
        }) => deleteQuestion(formId, questionId),
        onSuccess: (_, variables) => {
            toast.success("Question deleted successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["forms:detail", variables.formId],
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
    formId: number,
    order: number[],
): Promise<{ data: FormType }> {
    const response = await api<{ data: FormType }>(
        `/api/forms/${formId}/questions/reorder`,
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

export function useReorderFormQuestions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ formId, order }: { formId: number; order: number[] }) =>
            reorderQuestions(formId, order),
        onSuccess: (_, variables) => {
            toast.success("Questions reordered successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["forms:detail", variables.formId],
            });
        },
        onError: () => {
            toast.error("Failed to reorder questions", {
                position: "top-center",
            });
        },
    });
}
