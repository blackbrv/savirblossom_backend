import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../api";

export type AddressType = {
    id: number;
    customer_id: number;
    label: string | null;
    recipient_name: string;
    phone_number: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
};

export type CreateAddressData = {
    label?: string;
    recipient_name: string;
    phone_number: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default?: boolean;
};

export type UpdateAddressData = {
    label?: string;
    recipient_name: string;
    phone_number: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default?: boolean;
};

async function getAddresses(
    customerId: number,
): Promise<{ data: AddressType[] }> {
    const response = await api<{ data: AddressType[] }>(
        `/api/customers/${customerId}/addresses`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        },
    );
    return response;
}

export function useAddresses(customerId: number) {
    return useQuery({
        queryKey: ["addresses", customerId],
        queryFn: () => getAddresses(customerId),
        enabled: !!customerId,
    });
}

async function createAddress(
    customerId: number,
    data: CreateAddressData,
): Promise<{ data: AddressType }> {
    const response = await api<{ data: AddressType }>(
        `/api/customers/${customerId}/addresses`,
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

export function useCreateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            customerId,
            data,
        }: {
            customerId: number;
            data: CreateAddressData;
        }) => createAddress(customerId, data),
        onSuccess: (_, variables) => {
            toast.success("Address created successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["addresses", variables.customerId],
            });
        },
        onError: () => {
            toast.error("Failed to create address", {
                position: "top-center",
            });
        },
    });
}

async function updateAddress(
    addressId: number,
    data: UpdateAddressData,
): Promise<{ data: AddressType }> {
    const response = await api<{ data: AddressType }>(
        `/api/addresses/${addressId}`,
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

export function useUpdateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            addressId,
            data,
            customerId,
        }: {
            addressId: number;
            data: UpdateAddressData;
            customerId: number;
        }) => updateAddress(addressId, data),
        onSuccess: (_, variables) => {
            toast.success("Address updated successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["addresses", variables.customerId],
            });
        },
        onError: () => {
            toast.error("Failed to update address", {
                position: "top-center",
            });
        },
    });
}

async function deleteAddress(
    addressId: number,
    customerId: number,
): Promise<{ message: string }> {
    const response = await api<{ message: string }>(
        `/api/addresses/${addressId}`,
        {
            method: "DELETE",
            headers: {
                Accept: "application/json",
            },
        },
    );
    return response;
}

export function useDeleteAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            addressId,
            customerId,
        }: {
            addressId: number;
            customerId: number;
        }) => deleteAddress(addressId, customerId),
        onSuccess: (_, variables) => {
            toast.success("Address deleted successfully", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["addresses", variables.customerId],
            });
        },
        onError: () => {
            toast.error("Failed to delete address", {
                position: "top-center",
            });
        },
    });
}

async function setDefaultAddress(
    addressId: number,
    customerId: number,
): Promise<{ data: AddressType }> {
    const response = await api<{ data: AddressType }>(
        `/api/addresses/${addressId}/set-default`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({}),
        },
    );
    return response;
}

export function useSetDefaultAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            addressId,
            customerId,
        }: {
            addressId: number;
            customerId: number;
        }) => setDefaultAddress(addressId, customerId),
        onSuccess: (_, variables) => {
            toast.success("Default address updated", {
                position: "top-center",
            });
            queryClient.invalidateQueries({
                queryKey: ["addresses", variables.customerId],
            });
        },
        onError: () => {
            toast.error("Failed to set default address", {
                position: "top-center",
            });
        },
    });
}
