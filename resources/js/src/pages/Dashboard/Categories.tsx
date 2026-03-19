import React from "react";
import { Button } from "@/components/ui/button";
import { categoryColumns } from "@/lib/columns";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useBouquetCategories } from "@/services/Bouquets/BouquetsApi";
import DataTable from "@/src/components/ui/DataTable";
import { Plus } from "lucide-react";

export default function Categories() {
    const [page, setPage] = React.useState(1);
    const { data } = useBouquetCategories({ page, unfilterred: true });

    const categories = data?.data ?? [];
    const currentPage = data?.current_page ?? 1;
    const lastPage = data?.last_page ?? 1;

    return (
        <main className="h-screen mx-auto flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Categories
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center">
                    <Button className="capitalize" asChild>
                        <a href="/dashboard/categories/create">
                            <Plus className="text-primary-foreground" />
                            Create new category
                        </a>
                    </Button>
                </div>

                <DataTable columns={categoryColumns} data={categories} />

                {lastPage > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
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
                                        isActive={pageNum === currentPage}
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
            </section>
        </main>
    );
}
