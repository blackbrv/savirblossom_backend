import React from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Mail,
    Pencil,
    Plus,
    Trash2,
    User,
    MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    CustomerType,
    useResendSetupEmail,
    useResendVerificationEmail,
} from "@/services/Customers/CustomersApi";
import {
    AddressType,
    useAddresses,
    useCreateAddress,
    useUpdateAddress,
    useDeleteAddress,
    useSetDefaultAddress,
    CreateAddressData,
    UpdateAddressData,
} from "@/services/Addresses/AddressesApi";
import { orderColumns } from "@/lib/columns";
import { useOrders, OrderType } from "@/services/Orders/OrdersApi";
import DataTable from "@/src/components/ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";

type CustomerDetailViewProps = {
    data?: CustomerType;
    isLoading?: boolean;
};

function AddressTabContent({ customerId }: { customerId: number }) {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingAddress, setEditingAddress] =
        React.useState<AddressType | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = React.useState<number | null>(
        null,
    );

    const { data: addressesData, isLoading: isAddressesLoading } =
        useAddresses(customerId);
    const createAddressMutation = useCreateAddress();
    const updateAddressMutation = useUpdateAddress();
    const deleteAddressMutation = useDeleteAddress();
    const setDefaultAddressMutation = useSetDefaultAddress();

    const addresses = addressesData?.data ?? [];

    const form = useForm<CreateAddressData | UpdateAddressData>({
        defaultValues: {
            label: "",
            recipient_name: "",
            phone_number: "",
            address_line1: "",
            address_line2: "",
            city: "",
            state: "",
            postal_code: "",
            country: "",
            is_default: false,
        },
    });

    React.useEffect(() => {
        if (editingAddress) {
            form.reset({
                label: editingAddress.label ?? "",
                recipient_name: editingAddress.recipient_name,
                phone_number: editingAddress.phone_number,
                address_line1: editingAddress.address_line1,
                address_line2: editingAddress.address_line2 ?? "",
                city: editingAddress.city,
                state: editingAddress.state,
                postal_code: editingAddress.postal_code,
                country: editingAddress.country,
                is_default: editingAddress.is_default,
            });
        } else {
            form.reset({
                label: "",
                recipient_name: "",
                phone_number: "",
                address_line1: "",
                address_line2: "",
                city: "",
                state: "",
                postal_code: "",
                country: "",
                is_default: false,
            });
        }
    }, [editingAddress, form, isDialogOpen]);

    const handleOpenDialog = (address?: AddressType) => {
        if (address) {
            setEditingAddress(address);
        } else {
            setEditingAddress(null);
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingAddress(null);
        form.reset();
    };

    const onSubmit = (data: CreateAddressData | UpdateAddressData) => {
        if (editingAddress) {
            updateAddressMutation.mutate(
                { addressId: editingAddress.id, data, customerId },
                { onSuccess: () => handleCloseDialog() },
            );
        } else {
            createAddressMutation.mutate(
                { customerId, data },
                { onSuccess: () => handleCloseDialog() },
            );
        }
    };

    const handleDelete = (addressId: number) => {
        deleteAddressMutation.mutate(
            { addressId, customerId },
            { onSuccess: () => setDeleteConfirmId(null) },
        );
    };

    const handleSetDefault = (addressId: number) => {
        setDefaultAddressMutation.mutate({ addressId, customerId });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus className="size-4" />
                    Add Address
                </Button>
            </div>

            {isAddressesLoading ? (
                <div className="flex items-center justify-center h-32">
                    <span className="text-muted-foreground">
                        Loading addresses...
                    </span>
                </div>
            ) : addresses.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                        <MapPin className="size-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                            No addresses found
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleOpenDialog()}
                        >
                            Add First Address
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`border rounded-lg p-4 relative ${
                                address.is_default
                                    ? "border-primary bg-primary/5"
                                    : "border-border"
                            }`}
                        >
                            {address.is_default && (
                                <Badge
                                    className="absolute top-2 right-2"
                                    variant="default"
                                >
                                    Default
                                </Badge>
                            )}
                            {address.label && (
                                <p className="font-medium">{address.label}</p>
                            )}
                            <p className="text-sm">{address.recipient_name}</p>
                            <p className="text-sm text-muted-foreground">
                                {address.phone_number}
                            </p>
                            <p className="text-sm mt-2">
                                {address.address_line1}
                                {address.address_line2 &&
                                    `, ${address.address_line2}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {address.city}, {address.state}{" "}
                                {address.postal_code}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {address.country}
                            </p>
                            <div className="flex gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenDialog(address)}
                                >
                                    <Pencil className="size-3" />
                                </Button>
                                {!address.is_default && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleSetDefault(address.id)
                                            }
                                        >
                                            Set Default
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                setDeleteConfirmId(address.id)
                                            }
                                        >
                                            <Trash2 className="size-3" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAddress ? "Edit Address" : "Add Address"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingAddress
                                ? "Update the address details below."
                                : "Fill in the address details below."}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="label"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Label (optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Home, Office, etc."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="is_default"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Set as default address
                                                </FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="recipient_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Recipient Name *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address_line1"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address Line 1 *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address_line2"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Address Line 2 (optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="postal_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Postal Code *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseDialog}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        createAddressMutation.isPending ||
                                        updateAddressMutation.isPending
                                    }
                                >
                                    {editingAddress ? "Update" : "Create"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!deleteConfirmId}
                onOpenChange={() => setDeleteConfirmId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Address</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this address? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmId(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                deleteConfirmId && handleDelete(deleteConfirmId)
                            }
                            disabled={deleteAddressMutation.isPending}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function CustomerDetailView({
    data,
    isLoading,
}: CustomerDetailViewProps) {
    const navigate = useNavigate();
    const resendSetupEmailMutation = useResendSetupEmail();
    const resendVerificationEmailMutation = useResendVerificationEmail();
    const [page, setPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);

    const { data: ordersData, isLoading: isOrdersLoading } = useOrders({
        customer_id: data?.id,
        page,
        perPage,
    });

    const orders = ordersData?.data ?? [];
    const currentPage = ordersData?.meta?.current_page ?? 1;
    const lastPage = ordersData?.meta?.last_page ?? 1;

    const handleEdit = React.useCallback(() => {
        navigate(`/dashboard/customers/${data?.id}/edit`);
    }, [navigate, data?.id]);

    const handleResendSetupEmail = React.useCallback(() => {
        if (data?.id) {
            resendSetupEmailMutation.mutate(data.id);
        }
    }, [data?.id, resendSetupEmailMutation]);

    const handleResendVerificationEmail = React.useCallback(() => {
        if (data?.id) {
            resendVerificationEmailMutation.mutate(data.id);
        }
    }, [data?.id, resendVerificationEmailMutation]);

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
                        <TabsTrigger value="addresses" className="px-4 py-2">
                            Addresses
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

                            {data.full_name && (
                                <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">
                                        Full Name
                                    </span>
                                    <p className="text-base">
                                        {data.full_name}
                                    </p>
                                </div>
                            )}

                            {data.birthday && (
                                <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">
                                        Birthday
                                    </span>
                                    <p className="text-base">
                                        {new Date(
                                            data.birthday,
                                        ).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            )}

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

                    <TabsContent
                        value="addresses"
                        className="flex-1 p-6 flex flex-col gap-4"
                    >
                        <AddressTabContent customerId={data.id} />
                    </TabsContent>

                    <TabsContent
                        value="orders"
                        className="flex-1 p-6 flex flex-col gap-4"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    Per page:
                                </span>
                                <Select
                                    value={perPage.toString()}
                                    onValueChange={(val) => {
                                        setPerPage(Number(val));
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[10, 20, 30, 40, 50].map((num) => (
                                            <SelectItem
                                                key={num}
                                                value={num.toString()}
                                            >
                                                {num}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DataTable
                            columns={
                                orderColumns as ColumnDef<unknown, unknown>[]
                            }
                            data={orders as OrderType[]}
                            loading={isOrdersLoading}
                        />

                        {lastPage > 1 && (
                            <Pagination className="flex mx-0 w-max">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.max(1, p - 1),
                                                )
                                            }
                                            className={
                                                currentPage === 1
                                                    ? "pointer-events-none opacity-50"
                                                    : "cursor-pointer"
                                            }
                                        />
                                    </PaginationItem>
                                    {Array.from(
                                        { length: lastPage },
                                        (_, i) => i + 1,
                                    ).map((pageNum) => (
                                        <PaginationItem key={pageNum}>
                                            <PaginationLink
                                                isActive={
                                                    pageNum === currentPage
                                                }
                                                onClick={() => setPage(pageNum)}
                                                className="cursor-pointer"
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.min(lastPage, p + 1),
                                                )
                                            }
                                            className={
                                                currentPage === lastPage
                                                    ? "pointer-events-none opacity-50"
                                                    : "cursor-pointer"
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}

                        {!isOrdersLoading && orders.length === 0 && (
                            <div className="flex items-center justify-center h-32">
                                <p className="text-muted-foreground">
                                    No orders found for this customer
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent
                        value="account"
                        className="flex-1 p-6 space-y-6"
                    >
                        <div className="space-y-6">
                            {!data.email_verified_at && (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                >
                                                    Email Not Verified
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                                                This account requires email
                                                verification. The customer needs
                                                to verify their email before
                                                they can log in.
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={
                                                    handleResendVerificationEmail
                                                }
                                                disabled={
                                                    resendVerificationEmailMutation.isPending
                                                }
                                                className="mt-3 gap-2"
                                            >
                                                <Mail className="size-4" />
                                                {resendVerificationEmailMutation.isPending
                                                    ? "Sending..."
                                                    : "Resend Verification Email"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!data.password_set && data.email_verified_at && (
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
                                                    resendSetupEmailMutation.isPending
                                                }
                                                className="mt-3 gap-2"
                                            >
                                                <Mail className="size-4" />
                                                {resendSetupEmailMutation.isPending
                                                    ? "Sending..."
                                                    : "Resend Setup Email"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {data.email_verified_at && data.password_set && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                        >
                                            Account Ready
                                        </Badge>
                                        <span className="text-sm text-green-700 dark:text-green-300">
                                            Email verified & password set
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
