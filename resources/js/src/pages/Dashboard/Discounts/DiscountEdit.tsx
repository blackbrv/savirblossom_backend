import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    useCoupon,
    useUpdateCoupon,
    type CreateCouponData,
} from "@/services/Coupons/CouponsApi";

type CouponFormData = {
    code: string;
    name: string;
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    min_order_value?: number;
    usage_limit?: number;
    max_uses_per_user?: number;
    valid_from?: string;
    valid_until?: string;
    is_active: boolean;
    is_stackable: boolean;
    priority: number;
    bouquet_ids: number[];
    category_ids: number[];
};

export default function DiscountEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const couponId = Number(id);

    const { data: couponData, isLoading: isFetching } = useCoupon(couponId);
    const updateCouponMutation = useUpdateCoupon();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CouponFormData>({
        defaultValues: {
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
        },
    });

    React.useEffect(() => {
        if (couponData?.data) {
            const coupon = couponData.data;
            setValue("code", coupon.code);
            setValue("name", coupon.name);
            setValue("discount_type", coupon.discount_type);
            setValue("discount_value", coupon.discount_value);
            setValue("min_order_value", coupon.min_order_value ?? undefined);
            setValue("usage_limit", coupon.usage_limit ?? undefined);
            setValue(
                "max_uses_per_user",
                coupon.max_uses_per_user ?? undefined,
            );
            setValue("valid_from", coupon.valid_from ?? undefined);
            setValue("valid_until", coupon.valid_until ?? undefined);
            setValue("is_active", coupon.is_active);
            setValue("is_stackable", coupon.is_stackable);
            setValue("priority", coupon.priority);
        }
    }, [couponData, setValue]);

    const is_active = watch("is_active");
    const is_stackable = watch("is_stackable");
    const discount_type = watch("discount_type");

    const onSubmit = async (data: CouponFormData) => {
        try {
            await updateCouponMutation.mutateAsync({
                id: couponId,
                data,
            });
            toast.success("Coupon updated successfully");
            navigate(`/dashboard/discount`);
        } catch (error) {
            toast.error("Failed to update coupon");
        }
    };

    if (isFetching) {
        return (
            <main className="h-screen mx-auto flex flex-col gap-8 justify-center p-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/dashboard/discount")}
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <h3 className="desktop-tablet__heading__h3 text-primary">
                        Edit Coupon
                    </h3>
                </div>
                <p>Loading...</p>
            </main>
        );
    }

    return (
        <main className="h-screen mx-auto flex flex-col gap-8 justify-center p-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/dashboard/discount")}
                >
                    <ArrowLeft className="size-4" />
                </Button>
                <h3 className="desktop-tablet__heading__h3 text-primary">
                    Edit Coupon
                </h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <section className="bg-background border border-border w-full h-full flex flex-col gap-6 p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="code">Code *</Label>
                            <Input
                                id="code"
                                {...register("code", {
                                    required: "Code is required",
                                })}
                                placeholder="e.g., SUMMER20"
                            />
                            {errors.code && (
                                <p className="text-sm text-red-500">
                                    {errors.code.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                {...register("name", {
                                    required: "Name is required",
                                })}
                                placeholder="e.g., Summer Sale"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="discount_type">
                                Discount Type *
                            </Label>
                            <Select
                                value={discount_type}
                                onValueChange={(val) =>
                                    setValue(
                                        "discount_type",
                                        val as "percentage" | "fixed_amount",
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">
                                        Percentage (%)
                                    </SelectItem>
                                    <SelectItem value="fixed_amount">
                                        Fixed Amount ($)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="discount_value">
                                Discount Value *
                            </Label>
                            <Input
                                id="discount_value"
                                type="number"
                                {...register("discount_value", {
                                    required: "Value is required",
                                    min: {
                                        value: 0,
                                        message: "Value must be positive",
                                    },
                                    valueAsNumber: true,
                                })}
                                placeholder={
                                    discount_type === "percentage"
                                        ? "e.g., 10 for 10%"
                                        : "e.g., 10 for $10"
                                }
                            />
                            {errors.discount_value && (
                                <p className="text-sm text-red-500">
                                    {errors.discount_value.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="min_order_value">
                                Minimum Order Value
                            </Label>
                            <Input
                                id="min_order_value"
                                type="number"
                                {...register("min_order_value", {
                                    valueAsNumber: true,
                                })}
                                placeholder="Optional"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="usage_limit">Usage Limit</Label>
                            <Input
                                id="usage_limit"
                                type="number"
                                {...register("usage_limit", {
                                    valueAsNumber: true,
                                })}
                                placeholder="Optional (leave empty for unlimited)"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max_uses_per_user">
                                Max Uses Per User
                            </Label>
                            <Input
                                id="max_uses_per_user"
                                type="number"
                                {...register("max_uses_per_user", {
                                    valueAsNumber: true,
                                })}
                                placeholder="Optional"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Input
                                id="priority"
                                type="number"
                                {...register("priority", {
                                    valueAsNumber: true,
                                })}
                                placeholder="Default: 0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="valid_from">Valid From</Label>
                            <Input
                                id="valid_from"
                                type="date"
                                {...register("valid_from")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="valid_until">Valid Until</Label>
                            <Input
                                id="valid_until"
                                type="date"
                                {...register("valid_until")}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pt-4">
                        <div className="flex items-center gap-2">
                            <Switch
                                id="is_active"
                                checked={is_active}
                                onCheckedChange={(checked) =>
                                    setValue("is_active", checked)
                                }
                            />
                            <Label htmlFor="is_active">Active</Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="is_stackable"
                                checked={is_stackable}
                                onCheckedChange={(checked) =>
                                    setValue("is_stackable", checked)
                                }
                            />
                            <Label htmlFor="is_stackable">Stackable</Label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/dashboard/discount")}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </section>
            </form>
        </main>
    );
}
