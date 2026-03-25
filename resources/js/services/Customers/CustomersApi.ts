import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../api";
import { AddressType } from "../Addresses/AddressesApi";

export type CustomerType = {
    id: number;
    email: string;
    username: string;
    full_name: string | null;
    birthday: string | null;
    phone_number: string | null;
    profile_picture: string | null;
    provider: "email" | "google";
    google_id: string | null;
    password_set: boolean;
    email_verified_at: string | null;
    addresses?: AddressType[];
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

export type GetCustomersPaginatedResponse = {
    data: CustomerType[];
    links: PaginatedLinks;
    meta: PaginatedMeta;
};

type GetCustomersParams = {
    page?: number;
    perPage?: number;
    search?: string;
    provider?: string;
};

async function GetCustomers({
    page = 1,
    perPage = 10,
    search,
    provider,
}: GetCustomersParams): Promise<GetCustomersPaginatedResponse> {
    const searchParams = new URLSearchParams();

    const params = {
        page,
        per_page: perPage,
        search,
        provider,
    };

    Object.entries(params).forEach(([name, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(name, String(value));
        }
    });

    const response: GetCustomersPaginatedResponse = await api(
        `/api/customers?${searchParams.toString()}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useCustomers({
    page = 1,
    perPage = 10,
    search = undefined,
    provider = undefined,
}: GetCustomersParams = {}) {
    return useQuery({
        queryKey: ["customers:list", page, perPage, search, provider],
        queryFn: () =>
            GetCustomers({
                page,
                perPage,
                search,
                provider,
            }),
    });
}

async function getCustomerById(id: number): Promise<{ data: CustomerType }> {
    const response = await api<{ data: CustomerType }>(`/api/customers/${id}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    return response;
}

export function useCustomerById({ id }: { id: number }) {
    return useQuery({
        queryKey: ["customer:details", id],
        queryFn: () => getCustomerById(id),
    });
}

export type UpdateCustomerData = {
    username?: string;
    full_name?: string;
    birthday?: string;
    phone_number?: string;
    profile_picture?: string;
};

async function updateCustomer(
    id: number,
    data: UpdateCustomerData,
): Promise<{ data: CustomerType }> {
    const response = await api<{ data: CustomerType }>(`/api/customers/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });

    return response;
}

export function useUpdateCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCustomerData }) =>
            updateCustomer(id, data),
        onSuccess: (_, variables) => {
            toast.success("Customer updated successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({ queryKey: ["customers:list"] });
            queryClient.invalidateQueries({
                queryKey: ["customer:details", variables.id],
            });
        },
        onError: () => {
            toast.error("Failed to update customer", {
                position: "top-center",
            });
        },
    });
}

async function deleteCustomer(id: number): Promise<{ message: string }> {
    const response = await api<{ message: string }>(`/api/customers/${id}`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
        },
    });

    return response;
}

export function useDeleteCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteCustomer(id),
        onSuccess: () => {
            toast.success("Customer deleted successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({ queryKey: ["customers:list"] });
        },
        onError: () => {
            toast.error("Failed to delete customer", {
                position: "top-center",
            });
        },
    });
}

export type CreateCustomerData = {
    email: string;
    username: string;
    full_name?: string;
    birthday?: string;
    phone_number?: string;
    profile_picture?: string;
};

async function createCustomer(
    data: CreateCustomerData,
): Promise<{ data: CustomerType }> {
    const response = await api<{ data: CustomerType }>(`/api/customers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });

    return response;
}

export function useCreateCustomer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCustomerData) => createCustomer(data),
        onSuccess: () => {
            toast.success(
                "Customer created successfully. Password setup email sent.",
                {
                    position: "top-center",
                },
            );
            queryClient.invalidateQueries({ queryKey: ["customers:list"] });
        },
        onError: () => {
            toast.error("Failed to create customer", {
                position: "top-center",
            });
        },
    });
}

async function resendSetupEmail(
    customerId: number,
): Promise<{ message: string }> {
    const response = await api<{ message: string }>(
        `/api/customers/${customerId}/resend-setup-email`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useResendSetupEmail() {
    return useMutation({
        mutationFn: (customerId: number) => resendSetupEmail(customerId),
        onSuccess: () => {
            toast.success("Password setup email sent successfully", {
                position: "top-center",
            });
        },
        onError: () => {
            toast.error("Failed to send password setup email", {
                position: "top-center",
            });
        },
    });
}

async function resendVerificationEmail(
    customerId: number,
): Promise<{ message: string }> {
    const response = await api<{ message: string }>(
        `/api/customers/${customerId}/resend-verification-email`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useResendVerificationEmail() {
    return useMutation({
        mutationFn: (customerId: number) => resendVerificationEmail(customerId),
        onSuccess: () => {
            toast.success("Verification email sent successfully", {
                position: "top-center",
            });
        },
        onError: () => {
            toast.error("Failed to send verification email", {
                position: "top-center",
            });
        },
    });
}
