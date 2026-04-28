import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
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
import { useCreateCoupon } from "@/services/Coupons/CouponsApi";

function generateCouponCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "SAVE";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

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

export default function DiscountCreate() {
    const navigate = useNavigate();
    const createCouponMutation = useCreateCoupon();

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

    const is_active = watch("is_active");
    const is_stackable = watch("is_stackable");
    const discount_type = watch("discount_type");

    const handleGenerateCode = () => {
        const newCode = generateCouponCode();
        setValue("code", newCode);
    };

    const onSubmit = async (data: CouponFormData) => {
        try {
            const response = await createCouponMutation.mutateAsync(data);
            toast.success("Coupon created successfully");
            navigate(`/dashboard/discount/${response.data.id}`);
        } catch (error) {
            toast.error("Failed to create coupon");
        }
    };

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Create New Coupon
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/discount")}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Discounts
                    </Button>
                    <Button
                        type="submit"
                        form="coupon-form"
                        disabled={isSubmitting}
                    >
                        Create Coupon
                    </Button>
                </div>

                <form id="coupon-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="code">Code *</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="code"
                                    {...register("code")}
                                    placeholder="Leave empty to auto-generate"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateCode}
                                >
                                    <RefreshCw className="size-4 mr-1" />
                                    Generate
                                </Button>
                            </div>
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
                </form>
            </section>
        </main>
    );
}
