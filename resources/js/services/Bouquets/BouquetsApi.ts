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

export type GetBouquetsPaginatedResponse = {
    current_page: number;
    data: GetBouquetsResponse[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        page: number | null;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
};

type GetBouquetsType = {
    page?: number;
    perPage?: number;
    categoryId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minStock?: number;
    maxStock?: number;
    inStock?: boolean;
};

async function GetBouquets({
    page,
    perPage,
    categoryId,
    search,
    minPrice,
    maxPrice,
    minStock,
    maxStock,
    inStock,
}: GetBouquetsType) {
    const searchParams = new URLSearchParams();

    const params = {
        unfilterred: "true",
        page,
        per_page: perPage,
        category_id: categoryId,
        search,
        min_price: minPrice,
        max_price: maxPrice,
        min_stock: minStock,
        max_stock: maxStock,
        in_stock: inStock,
    };

    Object.entries(params).forEach(([name, value]) => {
        if (value !== undefined && value !== null) {
            if (typeof value === "boolean") {
                searchParams.append(name, value ? "1" : "0");
            } else {
                searchParams.append(name, String(value));
            }
        }
    });

    const response: GetBouquetsPaginatedResponse = await api(
        `/api/bouquet?${searchParams.toString()}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        },
    );

    return response;
}

export function useBouquets({
    page = 1,
    perPage = 10,
    categoryId = undefined,
    search = undefined,
    minPrice = undefined,
    maxPrice = undefined,
    minStock = undefined,
    maxStock = undefined,
    inStock = undefined,
}: GetBouquetsType) {
    return useQuery({
        queryKey: [
            "bouquets:list",
            page,
            perPage,
            categoryId,
            search,
            minPrice,
            maxPrice,
            minStock,
            maxStock,
            inStock,
        ],
        queryFn: () =>
            GetBouquets({
                page,
                perPage,
                categoryId,
                search,
                minPrice,
                maxPrice,
                minStock,
                maxStock,
                inStock,
            }),
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
    search?: string;
    published?: boolean;
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
    search,
    published,
}: GetCategoriesParams) {
    const searchParams = new URLSearchParams();
    searchParams.append("page", String(page));
    searchParams.append("per_page", String(perPage));
    searchParams.append("unfilterred", String(unfilterred));

    if (search) {
        searchParams.append("search", search);
    }

    if (published !== undefined) {
        searchParams.append("published", published ? "1" : "0");
    }

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
    search = undefined,
    published = undefined,
}: GetCategoriesParams = {}) {
    return useQuery({
        queryKey: [
            "bouquet-categories:list",
            page,
            perPage,
            unfilterred,
            search,
            published,
        ],
        queryFn: () =>
            GetCategories({ page, perPage, unfilterred, search, published }),
    });
}

type BouquetCreateData = {
    name: string;
    description: string;
    price: string;
    stock: number;
    category_id: number;
    published: boolean;
    galleries?: { src: string; alt_text?: string }[];
};

type BouquetUpdateData = {
    name: string;
    description: string;
    price: string;
    stock: number;
    category_id: number;
    published: boolean;
};

type CreateBouquetResponse = {
    message: string;
    data: GetBouquetsResponse;
};

async function createBouquet(
    data: BouquetCreateData,
): Promise<CreateBouquetResponse> {
    const response = await api<CreateBouquetResponse>("/api/bouquet/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });

    return response;
}

export function useCreateBouquet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: BouquetCreateData) => createBouquet(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bouquets:list"] });
        },
    });
}

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
