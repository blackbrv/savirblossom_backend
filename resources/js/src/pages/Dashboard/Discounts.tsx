import React from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
    useCreateCoupon,
    useDeleteCoupon,
    useToggleCoupon,
    type CouponType,
    type CreateCouponData,
} from "@/services/Coupons/CouponsApi";
import DataTable from "@/src/components/ui/DataTable";
import { Plus, X, Tag, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";

export default function Discounts() {
    const navigate = useNavigate();
    const [page, setPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);
    const [search, setSearch] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);
    const [editingCoupon, setEditingCoupon] = React.useState<CouponType | null>(null);

    const { data, isLoading, refetch } = useCoupons();
    const createMutation = useCreateCoupon();
    const deleteMutation = useDeleteCoupon();
    const toggleMutation = useToggleCoupon();

    const coupons = data?.data ?? [];
    const currentPage = 1;
    const lastPage = 1;

    const handleCreate = async (data: CreateCouponData) => {
        try {
            await createMutation.mutateAsync(data);
            setIsOpen(false);
            refetch();
        } catch (error) {
            console.error("Failed to create coupon:", error);
        }
    };

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
                    {row.original.usage_limit && ` / ${row.original.usage_limit}`}
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
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="text-primary-foreground" />
                                Create new coupon
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New Coupon</DialogTitle>
                                <DialogDescription>
                                    Create a new discount coupon for your
                                    customers.
                                </DialogDescription>
                            </DialogHeader>
                            <CouponForm onSubmit={handleCreate} />
                        </DialogContent>
                    </Dialog>
                </div>

                <DataTable
                    columns={columns}
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
                                            if (currentPage > 1) setPage(currentPage - 1);
                                        }}
                                    />
                                </PaginationItem>
                                {Array.from({ length: lastPage }, (_, i) => i + 1).map(
                                    (pageNum) => (
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
                                    ),
                                )}
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

function CouponForm({
    onSubmit,
}: {
    onSubmit: (data: CreateCouponData) => Promise<void>;
}) {
    const [formData, setFormData] = React.useState<CreateCouponData>({
        code: "",
        name: "",
        discount_type: "percentage",
        discount_value: 0,
        min_order_value: undefined,
        usage_limit: undefined,
        max_uses_per_user: undefined,
        valid_from: undefined,
        valid_until: undefined,
        is_active: true,
        is_stackable: false,
        priority: 0,
        bouquet_ids: [],
        category_ids: [],
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleChange = (
        field: keyof CreateCouponData,
        value: string | number | boolean | undefined,
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="code" className="text-right">
                        Code
                    </Label>
                    <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => handleChange("code", e.target.value)}
                        className="col-span-3"
                        placeholder="e.g., SUMMER20"
                        required
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                        Name
                    </Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="col-span-3"
                        placeholder="e.g., Summer Sale"
                        required
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="discount_type" className="text-right">
                        Type
                    </Label>
                    <Select
                        value={formData.discount_type}
                        onValueChange={(val) =>
                            handleChange(
                                "discount_type",
                                val as "percentage" | "fixed_amount",
                            )
                        }
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="discount_value" className="text-right">
                        Value
                    </Label>
                    <Input
                        id="discount_value"
                        type="number"
                        value={formData.discount_value}
                        onChange={(e) =>
                            handleChange("discount_value", Number(e.target.value))
                        }
                        className="col-span-3"
                        min={0}
                        required
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="min_order_value" className="text-right">
                        Min Order
                    </Label>
                    <Input
                        id="min_order_value"
                        type="number"
                        value={formData.min_order_value ?? ""}
                        onChange={(e) =>
                            handleChange(
                                "min_order_value",
                                e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                            )
                        }
                        className="col-span-3"
                        min={0}
                        placeholder="Optional"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="usage_limit" className="text-right">
                        Usage Limit
                    </Label>
                    <Input
                        id="usage_limit"
                        type="number"
                        value={formData.usage_limit ?? ""}
                        onChange={(e) =>
                            handleChange(
                                "usage_limit",
                                e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                            )
                        }
                        className="col-span-3"
                        min={1}
                        placeholder="Optional (empty = unlimited)"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="valid_until" className="text-right">
                        Expires
                    </Label>
                    <Input
                        id="valid_until"
                        type="date"
                        value={formData.valid_until ?? ""}
                        onChange={(e) =>
                            handleChange(
                                "valid_until",
                                e.target.value || undefined,
                            )
                        }
                        className="col-span-3"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Coupon"}
                </Button>
            </DialogFooter>
        </form>
    );
}