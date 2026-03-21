import React from "react";
import { cn } from "@/lib/utils";
import {
    Pagination as ShadcnPagination,
    PaginationContent,
    PaginationEllipsis,
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

interface TablePaginationProps {
    currentPage: number;
    lastPage: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    perPageOptions?: number[];
    className?: string;
}

export function TablePagination({
    currentPage,
    lastPage,
    perPage,
    onPageChange,
    onPerPageChange,
    perPageOptions = [10, 20, 30, 40, 50],
    className,
}: TablePaginationProps) {
    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = [];
        const showEllipsisThreshold = 7;

        if (lastPage <= showEllipsisThreshold) {
            for (let i = 1; i <= lastPage; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (currentPage > 3) {
                pages.push("ellipsis");
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(lastPage - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < lastPage - 2) {
                pages.push("ellipsis");
            }

            pages.push(lastPage);
        }

        return pages;
    };

    return (
        <div
            className={cn("flex items-center justify-between gap-4", className)}
        >
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Per page:</span>
                <Select
                    value={perPage.toString()}
                    onValueChange={(val) => {
                        onPerPageChange(Number(val));
                        onPageChange(1);
                    }}
                >
                    <SelectTrigger className="w-20">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {perPageOptions.map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                                {num}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {lastPage > 1 && (
                <ShadcnPagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() =>
                                    onPageChange(Math.max(1, currentPage - 1))
                                }
                                className={
                                    currentPage === 1
                                        ? "pointer-events-none opacity-50"
                                        : "cursor-pointer"
                                }
                            />
                        </PaginationItem>

                        {getPageNumbers().map((page, index) =>
                            page === "ellipsis" ? (
                                <PaginationItem key={`ellipsis-${index}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            ) : (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        isActive={page === currentPage}
                                        onClick={() => onPageChange(page)}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ),
                        )}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() =>
                                    onPageChange(
                                        Math.min(lastPage, currentPage + 1),
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
                </ShadcnPagination>
            )}
        </div>
    );
}
