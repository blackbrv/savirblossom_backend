import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    BouquetCategoriesType,
    GetBouquetsResponse,
    useDeleteBouquet,
    useDeleteCategory,
} from "@/services/Bouquets/BouquetsApi";
import {
    CustomerType,
    useDeleteCustomer,
} from "@/services/Customers/CustomersApi";
import DeleteConfirmationDialog from "@/src/components/ui/DeleteConfirmationDialog";
import { priceFormatter } from "@/utils/utility";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash } from "lucide-react";
import React from "react";

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
        cell: ({ getValue, row }) => {
            const [isDialogOpen, setIsDialogOpen] = React.useState(false);
            const deleteBouquetMutation = useDeleteBouquet();
            const id = getValue();
            const { name } = row.original;
            return (
                <>
                    <DeleteConfirmationDialog
                        title="Delete Bouquet"
                        description={`Are you sure you want to delete "${name}"? This action cannot be undone.`}
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        onConfirm={() => {
                            deleteBouquetMutation.mutateAsync(Number(id));
                            setIsDialogOpen(false);
                        }}
                        isLoading={deleteBouquetMutation.isPending}
                    />
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
                                setIsDialogOpen(true);
                            }}
                        >
                            <Trash className="text-primary" />
                            Delete
                        </Button>
                    </div>
                </>
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
        cell: ({ getValue, row }) => {
            const [isDialogOpen, setIsDialogOpen] = React.useState(false);
            const deleteCategoryMutation = useDeleteCategory();
            const id = getValue();
            const { name } = row.original;
            return (
                <>
                    <DeleteConfirmationDialog
                        title="Delete Category"
                        description={`Are you sure you want to delete "${name}"? This action cannot be undone.`}
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        onConfirm={() => {
                            deleteCategoryMutation.mutateAsync(Number(id));
                            setIsDialogOpen(false);
                        }}
                        isLoading={deleteCategoryMutation.isPending}
                    />
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
                                setIsDialogOpen(true);
                            }}
                        >
                            <Trash className="text-primary" />
                            Delete
                        </Button>
                    </div>
                </>
            );
        },
    },
];

export const customerColumns: ColumnDef<CustomerType>[] = [
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
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "username",
        header: "Username",
    },
    {
        accessorKey: "phone_number",
        header: "Phone",
        cell: ({ getValue }) => {
            const value = getValue() as string | null;
            return value || "-";
        },
    },
    {
        accessorKey: "provider",
        header: "Provider",
        cell: ({ getValue }) => {
            const value = getValue() as "email" | "google";
            return (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                        value === "google"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    }`}
                >
                    {value === "google" ? "Google" : "Email"}
                </span>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ getValue }) => {
            const value = getValue() as string;
            return new Date(value).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        },
    },
    {
        accessorKey: "id",
        header: "Actions",
        cell: ({ getValue, row }) => {
            const [isDialogOpen, setIsDialogOpen] = React.useState(false);
            const deleteCustomerMutation = useDeleteCustomer();
            const id = getValue();
            const { email } = row.original;
            return (
                <>
                    <DeleteConfirmationDialog
                        title="Delete Customer"
                        description={`Are you sure you want to delete "${email}"? This action cannot be undone.`}
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        onConfirm={() => {
                            deleteCustomerMutation.mutateAsync(Number(id));
                            setIsDialogOpen(false);
                        }}
                        isLoading={deleteCustomerMutation.isPending}
                    />
                    <div className="flex gap-8 items-center">
                        <Button
                            asChild
                            variant={"link"}
                            size={"icon"}
                            className="gap-1"
                        >
                            <a href={`/dashboard/customers/${id}`}>
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
                            <a href={`/dashboard/customers/${id}/edit`}>
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
                                setIsDialogOpen(true);
                            }}
                        >
                            <Trash className="text-primary" />
                            Delete
                        </Button>
                    </div>
                </>
            );
        },
    },
];
