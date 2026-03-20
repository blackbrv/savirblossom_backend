import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Pencil, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    CustomerType,
    useResendSetupEmail,
} from "@/services/Customers/CustomersApi";

type CustomerDetailViewProps = {
    data?: CustomerType;
    isLoading?: boolean;
};

export default function CustomerDetailView({
    data,
    isLoading,
}: CustomerDetailViewProps) {
    const navigate = useNavigate();
    const resendEmailMutation = useResendSetupEmail();

    const handleEdit = React.useCallback(() => {
        navigate(`/dashboard/customers/${data?.id}/edit`);
    }, [navigate, data?.id]);

    const handleResendSetupEmail = React.useCallback(() => {
        if (data?.id) {
            resendEmailMutation.mutate(data.id);
        }
    }, [data?.id, resendEmailMutation]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">Loading...</span>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-muted-foreground">
                    Customer not found
                </span>
            </div>
        );
    }

    const isGoogleProvider = data.provider === "google";

    return (
        <main className="h-screen flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Customer Details
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
                        Back to List
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEdit}
                        className="gap-2"
                    >
                        <Pencil className="size-4" />
                        Edit
                    </Button>
                </div>

                <Tabs defaultValue="details" className="h-full flex flex-col">
                    <TabsList className="w-fit p-1">
                        <TabsTrigger value="details" className="px-4 py-2">
                            Details
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="px-4 py-2">
                            Orders
                        </TabsTrigger>
                        <TabsTrigger value="account" className="px-4 py-2">
                            Account
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="details"
                        className="flex-1 p-6 space-y-6"
                    >
                        <div className="space-y-6">
                            <div className="flex items-center gap-6">
                                {data.profile_picture ? (
                                    <img
                                        src={data.profile_picture}
                                        alt={data.username}
                                        className="size-20 rounded-full object-cover border-2 border-border"
                                    />
                                ) : (
                                    <div className="size-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                                        <User className="size-10 text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Email
                                </span>
                                <p className="text-lg font-medium">
                                    {data.email}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Username
                                </span>
                                <p className="text-base">{data.username}</p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Phone Number
                                </span>
                                <p className="text-base">
                                    {data.phone_number || "Not provided"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Provider
                                </span>
                                <div>
                                    <Badge
                                        variant="outline"
                                        className={
                                            isGoogleProvider
                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                        }
                                    >
                                        {isGoogleProvider ? "Google" : "Email"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="orders" className="flex-1 p-6">
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center space-y-2">
                                <p className="text-muted-foreground">
                                    Orders will be available soon
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value="account"
                        className="flex-1 p-6 space-y-6"
                    >
                        <div className="space-y-6">
                            {!data.password_set && (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                >
                                                    Password Not Set
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                                                This account requires setup. The
                                                customer needs to set up their
                                                password before they can log in.
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleResendSetupEmail}
                                                disabled={
                                                    resendEmailMutation.isPending
                                                }
                                                className="mt-3 gap-2"
                                            >
                                                <Mail className="size-4" />
                                                {resendEmailMutation.isPending
                                                    ? "Sending..."
                                                    : "Resend Setup Email"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {data.password_set && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                        >
                                            Account Ready
                                        </Badge>
                                        <span className="text-sm text-green-700 dark:text-green-300">
                                            Password is set
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Account Created
                                </span>
                                <p className="text-base">
                                    {new Date(
                                        data.created_at,
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">
                                    Last Updated
                                </span>
                                <p className="text-base">
                                    {new Date(
                                        data.updated_at,
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>

                            {data.google_id && (
                                <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">
                                        Google ID
                                    </span>
                                    <p className="text-sm text-muted-foreground font-mono">
                                        {data.google_id}
                                    </p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </section>
        </main>
    );
}
