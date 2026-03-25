import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    useCreateCustomer,
    CreateCustomerData,
} from "@/services/Customers/CustomersApi";

export default function CustomerCreate() {
    const navigate = useNavigate();
    const createCustomerMutation = useCreateCustomer();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateCustomerData>({
        defaultValues: {
            email: "",
            username: "",
            full_name: "",
            birthday: "",
            phone_number: "",
            profile_picture: "",
        },
    });

    const onSubmit = async (formData: CreateCustomerData) => {
        try {
            const response = await createCustomerMutation.mutateAsync({
                email: formData.email,
                username: formData.username,
                full_name: formData.full_name || undefined,
                birthday: formData.birthday || undefined,
                phone_number: formData.phone_number || undefined,
                profile_picture: formData.profile_picture || undefined,
            });

            navigate(`/dashboard/customers/${response.data.id}`);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Create Customer
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/customers")}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Customers
                    </Button>
                    <Button
                        type="submit"
                        form="customer-form"
                        disabled={isSubmitting}
                    >
                        Create Customer
                    </Button>
                </div>

                <form
                    id="customer-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex-1 p-6 space-y-6"
                >
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address",
                                    },
                                })}
                                placeholder="customer@example.com"
                                aria-invalid={!!errors.email}
                            />
                            {errors.email && (
                                <span className="text-sm text-destructive">
                                    {errors.email.message}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Username *</Label>
                            <Input
                                id="username"
                                {...register("username", {
                                    required: "Username is required",
                                    maxLength: {
                                        value: 255,
                                        message:
                                            "Username must be 255 characters or less",
                                    },
                                })}
                                placeholder="johndoe"
                                aria-invalid={!!errors.username}
                            />
                            {errors.username && (
                                <span className="text-sm text-destructive">
                                    {errors.username.message}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="full_name">
                                Full Name (optional)
                            </Label>
                            <Input
                                id="full_name"
                                {...register("full_name", {
                                    maxLength: {
                                        value: 255,
                                        message:
                                            "Full name must be 255 characters or less",
                                    },
                                })}
                                placeholder="John Doe"
                            />
                            {errors.full_name && (
                                <span className="text-sm text-destructive">
                                    {errors.full_name.message}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="birthday">
                                Birthday (optional)
                            </Label>
                            <Input
                                id="birthday"
                                type="date"
                                {...register("birthday")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone_number">
                                Phone Number (optional)
                            </Label>
                            <Input
                                id="phone_number"
                                {...register("phone_number", {
                                    maxLength: {
                                        value: 20,
                                        message:
                                            "Phone number must be 20 characters or less",
                                    },
                                })}
                                placeholder="+60123456789"
                            />
                            {errors.phone_number && (
                                <span className="text-sm text-destructive">
                                    {errors.phone_number.message}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profile_picture">
                                Profile Picture URL (optional)
                            </Label>
                            <Input
                                id="profile_picture"
                                {...register("profile_picture", {
                                    pattern: {
                                        value: /^https?:\/\/.+/,
                                        message: "Please enter a valid URL",
                                    },
                                    maxLength: {
                                        value: 500,
                                        message:
                                            "URL must be 500 characters or less",
                                    },
                                })}
                                placeholder="https://example.com/avatar.jpg"
                            />
                            {errors.profile_picture && (
                                <span className="text-sm text-destructive">
                                    {errors.profile_picture.message}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <p className="text-sm text-muted-foreground">
                            A password setup email will be sent to the customer
                            after the account is created. The customer will need
                            to set up their password before they can log in.
                        </p>
                    </div>
                </form>
            </section>
        </main>
    );
}
