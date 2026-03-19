import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    BouquetCategoriesType,
    GetBouquetsResponse,
} from "@/services/Bouquets/BouquetsApi";
import { priceFormatter } from "@/utils/utility";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash } from "lucide-react";

export const bouquetColumns: ColumnDef<GetBouquetsResponse>[] = [
    {
        accessorKey: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
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
    },
    {
        accessorKey: "id",
        header: "Id",
    },
    {
        accessorKey: "galleries",
        header: "Galleries",
        cell: ({ getValue }) => {
            const images = getValue() as GetBouquetsResponse["galleries"];

            if (!images || (images && images.length <= 0))
                return <span className="capitalize">No images</span>;

            const firstImages = images[0];

            return (
                <div className="relative w-10 h-10 rounded-sm">
                    <img
                        src={firstImages?.src}
                        alt={firstImages?.alt_text}
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
    {
        accessorKey: "id",
        header: "Actions",
        cell: ({ getValue }) => {
            const id = getValue();
            return (
                <div className="flex gap-8 items-center">
                    <Button
                        asChild
                        variant={"link"}
                        size={"icon"}
                        className="gap-1"
                    >
                        <a href={`/dashboard/bouquet/${id}`}>
                            <Eye className="text-primary" />
                            Preview
                        </a>
                    </Button>

                    <Button
                        asChild
                        variant={"link"}
                        size={"icon"}
                        className="gap-1"
                    >
                        <a href={`/dashboard/bouquet/${id}/edit`}>
                            <Pencil className="text-primary" />
                            Edit
                        </a>
                    </Button>

                    <Button
                        variant={"link"}
                        size={"icon"}
                        className="gap-1"
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <Trash className="text-primary" />
                        Delete
                    </Button>
                </div>
            );
        },
    },
];

export const categoryColumns: ColumnDef<BouquetCategoriesType>[] = [
    {
        accessorKey: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
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
    },
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
    {
        accessorKey: "id",
        header: "Actions",
        cell: ({ getValue }) => {
            const id = getValue();
            return (
                <div className="flex gap-8 items-center">
                    <Button
                        asChild
                        variant={"link"}
                        size={"icon"}
                        className="gap-1"
                    >
                        <a href={`/dashboard/categories/${id}/edit`}>
                            <Pencil className="text-primary" />
                            Edit
                        </a>
                    </Button>

                    <Button
                        variant={"link"}
                        size={"icon"}
                        className="gap-1"
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <Trash className="text-primary" />
                        Delete
                    </Button>
                </div>
            );
        },
    },
];
