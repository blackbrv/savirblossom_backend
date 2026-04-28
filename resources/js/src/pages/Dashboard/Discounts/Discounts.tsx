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
import { useCoupons } from "@/services/Coupons/CouponsApi";
import DataTable from "@/src/components/ui/DataTable";
import { couponColumns } from "@/lib/columns";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";

export default function Discounts() {
    const navigate = useNavigate();
    const [page, setPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);

    const { data, isLoading } = useCoupons();

    const coupons = data?.data ?? [];
    const currentPage = 1;
    const lastPage = 1;

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
                    columns={couponColumns as ColumnDef<unknown, unknown>[]}
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
