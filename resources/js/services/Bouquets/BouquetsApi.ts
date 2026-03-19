import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export type BouquetCategoriesType = {
    id: number;
    name: string;
    description: string;
    published: boolean | number;
    created_at: string;
    updated_at: string;
};

export type GalleriesType = {
    id: number;
    src?: string;
    alt_text?: string;
};

export type GetBouquetsResponse = {
    id: number;
    name: string;
    description: string;
    price: string;
    stock: number;
    published: boolean | number;
    created_at: string;
    updated_at: string;
    galleries: GalleriesType[];
    category: BouquetCategoriesType;
};

type GetBouquetsType = {
    page?: number;
    perPage?: number;
    categoryId?: number;
};

async function GetBouquets({ page, perPage, categoryId }: GetBouquetsType) {
    const searchParams = new URLSearchParams();

    const params: GetBouquetsType & { unfilterred: string } = {
        unfilterred: "true",
        page,
        perPage,
        categoryId,
    };

    Object.entries(params).forEach(([name, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(name, String(value));
        }
    });

    const response: { data: GetBouquetsResponse[] } = await api(
        `/api/bouquet?${searchParams.toString()}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response.data;
}

export function useBouquets({
    page = 1,
    perPage = 10,
    categoryId = undefined,
}: GetBouquetsType) {
    return useQuery({
        queryKey: ["bouquets:list"],
        queryFn: () => GetBouquets({ page, perPage, categoryId }),
    });
}

async function BouquetDetails(id: number) {
    const response: { data: GetBouquetsResponse } = await api(
        `/api/bouquet/${id}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response.data;
}

export function useBouquetDetails({ id }: { id: number }) {
    return useQuery({
        queryKey: ["bouquet:details", id],
        queryFn: () => BouquetDetails(id),
    });
}

type GetCategoriesParams = {
    page?: number;
    perPage?: number;
    unfilterred?: boolean;
};

export type GetCategoriesResponse = {
    current_page: number;
    data: BouquetCategoriesType[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
};

async function GetCategories({
    page = 1,
    perPage = 10,
    unfilterred = false,
}: GetCategoriesParams) {
    const searchParams = new URLSearchParams();
    searchParams.append("page", String(page));
    searchParams.append("per_page", String(perPage));
    searchParams.append("unfilterred", String(unfilterred));

    const response: GetCategoriesResponse = await api(
        `/api/bouquet/categories?${searchParams.toString()}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useBouquetCategories({
    page = 1,
    perPage = 10,
    unfilterred = false,
}: GetCategoriesParams = {}) {
    return useQuery({
        queryKey: ["bouquet-categories:list", page, perPage, unfilterred],
        queryFn: () => GetCategories({ page, perPage, unfilterred }),
    });
}

type BouquetUpdateData = {
    name: string;
    description: string;
    price: string;
    stock: number;
    category_id: number;
    published: boolean;
};

async function updateBouquet(id: number, data: BouquetUpdateData) {
    const response = await api(`/api/bouquet/update/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });

    return response;
}

export function useUpdateBouquet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: BouquetUpdateData }) =>
            updateBouquet(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["bouquets:list"] });
            queryClient.invalidateQueries({
                queryKey: ["bouquet:details", variables.id],
            });
        },
    });
}

type GalleryData = {
    src: string;
    alt_text?: string;
};

async function createGallery(bouquetId: number, data: GalleryData) {
    const response = await api(`/api/bouquet/${bouquetId}/galleries`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });

    return response;
}

export function useCreateGallery() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            bouquetId,
            data,
        }: {
            bouquetId: number;
            data: GalleryData;
        }) => createGallery(bouquetId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["bouquet:details", variables.bouquetId],
            });
        },
    });
}

async function updateGallery(
    bouquetId: number,
    galleryId: number,
    data: GalleryData,
) {
    const response = await api(
        `/api/bouquet/${bouquetId}/galleries/${galleryId}`,
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

export function useUpdateGallery() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            bouquetId,
            galleryId,
            data,
        }: {
            bouquetId: number;
            galleryId: number;
            data: GalleryData;
        }) => updateGallery(bouquetId, galleryId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["bouquet:details", variables.bouquetId],
            });
        },
    });
}

async function deleteGallery(bouquetId: number, galleryId: number) {
    const response = await api(
        `/api/bouquet/${bouquetId}/galleries/${galleryId}/delete`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useDeleteGallery() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            bouquetId,
            galleryId,
        }: {
            bouquetId: number;
            galleryId: number;
        }) => deleteGallery(bouquetId, galleryId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["bouquet:details", variables.bouquetId],
            });
        },
    });
}

type CategoryCreateData = {
    name: string;
    description?: string;
};

type CategoryUpdateData = {
    name: string;
    description?: string;
    published: boolean;
};

async function createCategory(data: CategoryCreateData) {
    const response = await api("/api/bouquet/categories/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });

    return response;
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CategoryCreateData) => createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["bouquet-categories:list"],
            });
        },
    });
}

async function updateCategory(id: number, data: CategoryUpdateData) {
    const response = await api(`/api/bouquet/categories/update/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });

    return response;
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CategoryUpdateData }) =>
            updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["bouquet-categories:list"],
            });
        },
    });
}

async function deleteCategory(id: number) {
    const response = await api(`/api/bouquet/categories/delete/${id}`, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
    });

    return response;
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["bouquet-categories:list"],
            });
        },
    });
}
