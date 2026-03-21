import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    BouquetCategoriesType,
    GetBouquetsResponse,
    useDeleteBouquet,
    useDeleteCategory,
} from "@/services/Bouquets/BouquetsApi";
import { ActionsCell } from "./ActionsCell";
import { priceFormatter } from "@/utils/utility";
import { ColumnDef } from "@tanstack/react-table";

export const selectColumn: ColumnDef<unknown> = {
    id: "select",
    header: ({ table }) => (
        <Checkbox
            checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
        />
    ),
    cell: ({ row }) => (
        <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
        />
    ),
    enableSorting: false,
    enableHiding: false,
};

function createBouquetActionsColumn() {
    return {
        accessorKey: "id",
        header: "Actions",
        cell: ({ getValue, row }: { getValue: () => unknown; row: { original: GetBouquetsResponse } }) => {
            const deleteBouquetMutation = useDeleteBouquet();
            const id = getValue() as number;
            const { name } = row.original;
            return (
                <ActionsCell
                    id={id}
                    name={name}
                    previewHref={`/dashboard/bouquet/${id}`}
                    editHref={`/dashboard/bouquet/${id}/edit`}
                    onDelete={() => deleteBouquetMutation.mutateAsync(id)}
                    isDeleting={deleteBouquetMutation.isPending}
                />
            );
        },
    } as ColumnDef<GetBouquetsResponse>;
}

function createCategoryActionsColumn() {
    return {
        accessorKey: "id",
        header: "Actions",
        cell: ({ getValue, row }: { getValue: () => unknown; row: { original: BouquetCategoriesType } }) => {
            const deleteCategoryMutation = useDeleteCategory();
            const id = getValue() as number;
            const { name } = row.original;
            return (
                <ActionsCell
                    id={id}
                    name={name}
                    editHref={`/dashboard/categories/${id}/edit`}
                    onDelete={() => deleteCategoryMutation.mutateAsync(id)}
                    isDeleting={deleteCategoryMutation.isPending}
                />
            );
        },
    } as ColumnDef<BouquetCategoriesType>;
}

export const bouquetColumns: ColumnDef<GetBouquetsResponse>[] = [
    selectColumn as ColumnDef<GetBouquetsResponse>,
    {
        accessorKey: "id",
        header: "Id",
    },
    {
        accessorKey: "galleries",
        header: "Galleries",
        cell: ({ getValue }) => {
            const images = getValue() as GetBouquetsResponse["galleries"];
            if (!images || images.length <= 0) {
                return <span className="capitalize">No images</span>;
            }
            const firstImage = images[0];
            return (
                <div className="relative w-10 h-10 rounded-sm">
                    <img
                        src={firstImage?.src}
                        alt={firstImage?.alt_text}
                        className="rounded-[inherit] object-cover w-full h-full"
                    />
                </div>
            );
        },
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "category.name",
        header: "Category",
    },
    {
        accessorKey: "stock",
        header: "Stock",
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ getValue }) => {
            const value = getValue();
            return priceFormatter(parseInt(value as string));
        },
    },
    {
        accessorKey: "published",
        header: "Published",
        cell: ({ getValue }) => {
            const value = getValue();
            const isPublished = value === 1 || value === true;
            return isPublished ? "true" : "false";
        },
    },
    createBouquetActionsColumn(),
];

export const categoryColumns: ColumnDef<BouquetCategoriesType>[] = [
    selectColumn as ColumnDef<BouquetCategoriesType>,
    {
        accessorKey: "id",
        header: "Id",
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "published",
        header: "Published",
        cell: ({ getValue }) => {
            const value = getValue();
            const isPublished = value === 1 || value === true;
            return isPublished ? "true" : "false";
        },
    },
    createCategoryActionsColumn(),
];
