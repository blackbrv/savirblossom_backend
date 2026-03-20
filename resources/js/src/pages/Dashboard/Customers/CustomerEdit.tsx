import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    useCustomerById,
    useUpdateCustomer,
    UpdateCustomerData,
} from "@/services/Customers/CustomersApi";
import { useParams } from "react-router";

export default function CustomerEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading } = useCustomerById({ id: Number(id) });

    const updateCustomerMutation = useUpdateCustomer();

    const customer = data?.data;

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UpdateCustomerData>({
        defaultValues: {
            username: "",
            phone_number: "",
            profile_picture: "",
        },
    });

    const profilePicture = watch("profile_picture");

    React.useEffect(() => {
        if (customer) {
            reset({
                username: customer.username,
                phone_number: customer.phone_number ?? "",
                profile_picture: customer.profile_picture ?? "",
            });
        }
    }, [customer, reset]);

    const onSubmit = async (formData: UpdateCustomerData) => {
        try {
            await updateCustomerMutation.mutateAsync({
                id: Number(id),
                data: {
                    username: formData.username || undefined,
                    phone_number: formData.phone_number || undefined,
                    profile_picture: formData.profile_picture || undefined,
                },
            });

            navigate(`/dashboard/customers/${id}`);
        } catch (error) {
            toast.error("Failed to update customer", {
                position: "top-center",
            });
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">Loading...</span>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">
                    Customer not found
                </span>
            </div>
        );
    }

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Edit Customer: {customer.email}
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/dashboard/customers/${id}`)}
                        className="gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Preview
                    </Button>
                    <Button
                        type="submit"
                        form="customer-form"
                        disabled={isSubmitting}
                    >
                        Save Changes
                    </Button>
                </div>

                <form id="customer-form" onSubmit={handleSubmit(onSubmit)}>
                    <Tabs
                        defaultValue="details"
                        className="h-full flex flex-col"
                    >
                        <TabsList className="w-fit p-1">
                            <TabsTrigger value="details" className="px-4 py-2">
                                Details
                            </TabsTrigger>
                            <TabsTrigger value="profile" className="px-4 py-2">
                                Profile Picture
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="details"
                            className="flex-1 p-6 space-y-6"
                        >
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
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
                                        aria-invalid={!!errors.username}
                                    />
                                    {errors.username && (
                                        <span className="text-sm text-destructive">
                                            {errors.username.message}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone_number">
                                        Phone Number
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
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={customer.email}
                                        disabled
                                        className="bg-muted cursor-not-allowed"
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        Email cannot be changed
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="provider">Provider</Label>
                                    <Input
                                        id="provider"
                                        value={
                                            customer.provider === "google"
                                                ? "Google"
                                                : "Email"
                                        }
                                        disabled
                                        className="bg-muted cursor-not-allowed"
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        Provider cannot be changed
                                    </span>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent
                            value="profile"
                            className="flex-1 p-6 space-y-6"
                        >
                            <div className="space-y-6">
                                <div className="flex items-start gap-6">
                                    {profilePicture ? (
                                        <img
                                            src={profilePicture}
                                            alt="Profile"
                                            className="size-24 rounded-full object-cover border-2 border-border"
                                        />
                                    ) : (
                                        <div className="size-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                                            <User className="size-12 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="profile_picture">
                                            Profile Picture URL
                                        </Label>
                                        <Input
                                            id="profile_picture"
                                            {...register("profile_picture", {
                                                pattern: {
                                                    value: /^https?:\/\/.+/,
                                                    message:
                                                        "Please enter a valid URL",
                                                },
                                            })}
                                            placeholder="https://example.com/avatar.jpg"
                                        />
                                        {errors.profile_picture && (
                                            <span className="text-sm text-destructive">
                                                {errors.profile_picture.message}
                                            </span>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            Enter a URL to an image
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </form>
            </section>
        </main>
    );
}
