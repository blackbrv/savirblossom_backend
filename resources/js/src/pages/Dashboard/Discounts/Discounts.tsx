import React from "react";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    useCoupons,
    useDeleteCoupon,
    useToggleCoupon,
    type CouponType,
} from "@/services/Coupons/CouponsApi";
import DataTable from "@/src/components/ui/DataTable";
import { Plus, Tag, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";

export default function Discounts() {
    const navigate = useNavigate();
    const [page, setPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);

    const { data, isLoading, refetch } = useCoupons();
    const deleteMutation = useDeleteCoupon();
    const toggleMutation = useToggleCoupon();

    const coupons = data?.data ?? [];
    const currentPage = 1;
    const lastPage = 1;

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this coupon?")) {
            try {
                await deleteMutation.mutateAsync(id);
                refetch();
            } catch (error) {
                console.error("Failed to delete coupon:", error);
            }
        }
    };

    const handleToggle = async (id: number) => {
        try {
            await toggleMutation.mutateAsync(id);
            refetch();
        } catch (error) {
            console.error("Failed to toggle coupon:", error);
        }
    };

    const columns: ColumnDef<CouponType>[] = [
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Tag className="size-4 text-muted-foreground" />
                    <span className="font-medium">{row.original.code}</span>
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "discount_type",
            header: "Type",
            cell: ({ row }) => (
                <span className="capitalize">
                    {row.original.discount_type === "percentage"
                        ? `${row.original.discount_value}%`
                        : `$${row.original.discount_value}`}
                </span>
            ),
        },
        {
            accessorKey: "usage_count",
            header: "Usage",
            cell: ({ row }) => (
                <span>
                    {row.original.usage_count}
                    {row.original.usage_limit &&
                        ` / ${row.original.usage_limit}`}
                </span>
            ),
        },
        {
            accessorKey: "valid_until",
            header: "Expires",
            cell: ({ row }) =>
                row.original.valid_until
                    ? new Date(row.original.valid_until).toLocaleDateString()
                    : "-",
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => (
                <span
                    className={`px-2 py-1 rounded text-xs ${
                        row.original.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                >
                    {row.original.is_active ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            navigate(
                                `/dashboard/discount/${row.original.id}/edit`,
                            )
                        }
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(row.original.id)}
                    >
                        {row.original.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(row.original.id)}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <main className="h-screen mx-auto flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Discount Coupons
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        onClick={() => navigate("/dashboard/discount/create")}
                    >
                        <Plus className="text-primary-foreground" />
                        Create new coupon
                    </Button>
                </div>

                <DataTable
                    columns={columns as ColumnDef<unknown, unknown>[]}
                    data={coupons}
                    loading={isLoading}
                />

                {lastPage > 1 && (
                    <div className="flex justify-between items-center">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage > 1)
                                                setPage(currentPage - 1);
                                        }}
                                    />
                                </PaginationItem>
                                {Array.from(
                                    { length: lastPage },
                                    (_, i) => i + 1,
                                ).map((pageNum) => (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(pageNum);
                                            }}
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage < lastPage)
                                                setPage(currentPage + 1);
                                        }}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </section>
        </main>
    );
}
