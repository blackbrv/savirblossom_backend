import { ColumnDef } from "@tanstack/react-table";
import { Tag, Eye, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    useDeleteCoupon,
    useToggleCoupon,
    CouponType,
} from "@/services/Coupons/CouponsApi";

function createCouponActionsColumn() {
    return {
        accessorKey: "id",
        header: "Actions",
        cell: ({
            getValue,
            row,
        }: {
            getValue: () => unknown;
            row: { original: CouponType };
        }) => {
            const deleteCouponMutation = useDeleteCoupon();
            const toggleCouponMutation = useToggleCoupon();
            const id = getValue() as number;

            const handleToggle = async () => {
                try {
                    await toggleCouponMutation.mutateAsync(id);
                } catch (error) {
                    console.error("Failed to toggle coupon:", error);
                }
            };

            return (
                <div className="flex gap-2 items-center">
                    <Button
                        variant={"link"}
                        size={"sm"}
                        className="gap-1 h-auto p-1"
                    >
                        <a
                            href={`/dashboard/discount/${id}`}
                            className="flex items-center gap-1"
                        >
                            <Eye className="size-4 text-primary" />
                            <span className="text-xs">View</span>
                        </a>
                    </Button>
                    <Button
                        variant={"link"}
                        size={"sm"}
                        className="gap-1 h-auto p-1"
                    >
                        <a
                            href={`/dashboard/discount/${id}/edit`}
                            className="flex items-center gap-1"
                        >
                            <Pencil className="size-4 text-primary" />
                            <span className="text-xs">Edit</span>
                        </a>
                    </Button>
                    <Button
                        variant={"link"}
                        size={"sm"}
                        className="gap-1 h-auto p-1"
                        onClick={(e) => {
                            e.preventDefault();
                            handleToggle();
                        }}
                    >
                        <span className="size-4 text-primary" />
                        <span className="text-xs">
                            {row.original.is_active ? "Deactivate" : "Activate"}
                        </span>
                    </Button>
                    <Button
                        variant={"link"}
                        size={"sm"}
                        className="gap-1 h-auto p-1"
                        onClick={(e) => {
                            e.preventDefault();
                            if (
                                confirm(
                                    "Are you sure you want to delete this coupon?",
                                )
                            ) {
                                deleteCouponMutation.mutate(id);
                            }
                        }}
                    >
                        <Trash className="size-4 text-primary" />
                        <span className="text-xs">Delete</span>
                    </Button>
                </div>
            );
        },
    } as ColumnDef<CouponType>;
}

export const couponColumns: ColumnDef<CouponType>[] = [
    {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }: { row: { original: CouponType } }) => (
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
        cell: ({ row }: { row: { original: CouponType } }) => (
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
        cell: ({ row }: { row: { original: CouponType } }) => (
            <span>
                {row.original.usage_count}
                {row.original.usage_limit && ` / ${row.original.usage_limit}`}
            </span>
        ),
    },
    {
        accessorKey: "valid_until",
        header: "Expires",
        cell: ({ row }: { row: { original: CouponType } }) =>
            row.original.valid_until
                ? new Date(row.original.valid_until).toLocaleDateString()
                : "-",
    },
    {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }: { row: { original: CouponType } }) => (
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
    createCouponActionsColumn() as ColumnDef<CouponType>,
];
