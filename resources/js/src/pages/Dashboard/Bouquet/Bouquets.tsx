import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { bouquetColumns } from "@/lib/columns";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    GetBouquetsResponse,
    useBouquets,
    useBouquetCategories,
    useBulkPublish,
} from "@/services/Bouquets/BouquetsApi";
import DataTable, { DataTableRef } from "@/src/components/ui/DataTable";
import { Plus, X } from "lucide-react";
import { RowSelectionState } from "@tanstack/react-table";
import FilterDropdown from "@/src/components/ui/FilterDropdown";
import { truncateNumber } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

export default function Bouquets() {
    const navigate = useNavigate();
    const [page, setPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);
    const [search, setSearch] = React.useState("");
    const [categoryId, setCategoryId] = React.useState<number | undefined>(
        undefined,
    );
    const [minPrice, setMinPrice] = React.useState<number | undefined>(
        undefined,
    );
    const [maxPrice, setMaxPrice] = React.useState<number | undefined>(
        undefined,
    );
    const [minStock, setMinStock] = React.useState<number | undefined>(
        undefined,
    );
    const [maxStock, setMaxStock] = React.useState<number | undefined>(
        undefined,
    );
    const [inStockOnly, setInStockOnly] = React.useState(false);
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
        {},
    );
    const bulkPublishMutation = useBulkPublish();
    const tableRef = useRef<DataTableRef>(null);

    const { data: categoriesData } = useBouquetCategories({
        perPage: 100,
        unfilterred: true,
    });

    const debouncedSearch = useDebounce(search, 400);

    React.useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const { data, isLoading } = useBouquets({
        page,
        perPage,
        search: debouncedSearch || undefined,
        categoryId,
        minPrice,
        maxPrice,
        minStock,
        maxStock,
        inStock: inStockOnly || undefined,
    });

    const bouquets = data?.data ?? [];
    const currentPage = data?.current_page ?? 1;
    const lastPage = data?.last_page ?? 1;

    const handleFilterChange =
        (setter: React.Dispatch<React.SetStateAction<number | undefined>>) =>
        (value: string) => {
            setter(value === "" ? undefined : Number(value));
            setPage(1);
        };

    const handleNumberInput =
        (setter: React.Dispatch<React.SetStateAction<number | undefined>>) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            setter(val === "" ? undefined : Number(val));
            setPage(1);
        };

    const clearFilters = () => {
        setSearch("");
        setCategoryId(undefined);
        setMinPrice(undefined);
        setMaxPrice(undefined);
        setMinStock(undefined);
        setMaxStock(undefined);
        setInStockOnly(false);
        setPage(1);
    };

    const hasActiveFilters =
        search !== "" ||
        categoryId !== undefined ||
        minPrice !== undefined ||
        maxPrice !== undefined ||
        minStock !== undefined ||
        maxStock !== undefined ||
        inStockOnly;

    const selectedIds = Object.keys(rowSelection)
        .filter((key) => rowSelection[key])
        .map((key) => bouquets[parseInt(key)]?.id)
        .filter((id): id is number => id !== undefined);

    const handleBulkPublish = () => {
        if (selectedIds.length === 0) return;
        bulkPublishMutation.mutate({ ids: selectedIds, published: true });
        tableRef.current?.resetRowSelection();
    };

    return (
        <main className="h-screen mx-auto flex flex-col gap-8 justify-center p-6">
            <h3 className="desktop-tablet__heading__h3 text-primary">
                Bouquets
            </h3>
            <section className="bg-background border border-border w-full h-full flex flex-col gap-4 p-4 rounded-lg">
                <div className="flex gap-3 items-center justify-between">
                    <Button
                        className="capitalize"
                        onClick={() => navigate("/dashboard/bouquet/create")}
                    >
                        <Plus className="text-primary-foreground" />
                        Create new bouquet
                    </Button>
                    {selectedIds.length > 0 && (
                        <Button
                            variant="default"
                            onClick={handleBulkPublish}
                            disabled={bulkPublishMutation.isPending}
                        >
                            Publish Selected ({selectedIds.length})
                        </Button>
                    )}
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="flex items-center gap-2"
                        >
                            <X className="size-4" />
                            Clear Filters
                        </Button>
                    )}
                </div>

                <div className="flex flex-wrap justify-between items-start gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="flex flex-wrap gap-3 items-end">
                        <Select
                            value={categoryId?.toString() ?? "all"}
                            onValueChange={(val) =>
                                handleFilterChange(setCategoryId)(
                                    val === "all" ? "" : val,
                                )
                            }
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Categories
                                </SelectItem>
                                {categoriesData?.data.map((cat) => (
                                    <SelectItem
                                        key={cat.id}
                                        value={cat.id.toString()}
                                    >
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <FilterDropdown
                            label="Price"
                            value={
                                minPrice !== undefined || maxPrice !== undefined
                                    ? `${minPrice !== undefined ? truncateNumber(minPrice) : "∞"} - ${maxPrice !== undefined ? truncateNumber(maxPrice) : "∞"}`
                                    : undefined
                            }
                            isActive={
                                minPrice !== undefined || maxPrice !== undefined
                            }
                        >
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">
                                    Min
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={minPrice ?? ""}
                                    onChange={handleNumberInput(setMinPrice)}
                                    min={0}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">
                                    Max
                                </label>
                                <Input
                                    type="number"
                                    placeholder="∞"
                                    value={maxPrice ?? ""}
                                    onChange={handleNumberInput(setMaxPrice)}
                                    min={0}
                                />
                            </div>
                        </FilterDropdown>

                        <FilterDropdown
                            label="Stock"
                            value={
                                inStockOnly
                                    ? "In Stock"
                                    : minStock !== undefined ||
                                        maxStock !== undefined
                                      ? `${minStock !== undefined ? truncateNumber(minStock) : "0"} - ${maxStock !== undefined ? truncateNumber(maxStock) : "∞"}`
                                      : undefined
                            }
                            isActive={
                                inStockOnly ||
                                minStock !== undefined ||
                                maxStock !== undefined
                            }
                        >
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="inStockOnly"
                                    checked={inStockOnly}
                                    onCheckedChange={(checked) => {
                                        setInStockOnly(checked === true);
                                        setPage(1);
                                    }}
                                />
                                <label
                                    htmlFor="inStockOnly"
                                    className="text-sm cursor-pointer"
                                >
                                    In Stock Only
                                </label>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">
                                    Min
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={minStock ?? ""}
                                    onChange={handleNumberInput(setMinStock)}
                                    min={0}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">
                                    Max
                                </label>
                                <Input
                                    type="number"
                                    placeholder="∞"
                                    value={maxStock ?? ""}
                                    onChange={handleNumberInput(setMaxStock)}
                                    min={0}
                                />
                            </div>
                        </FilterDropdown>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full md:w-auto md:max-w-52">
                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>

                <DataTable
                    ref={tableRef}
                    columns={bouquetColumns}
                    data={bouquets as GetBouquetsResponse[]}
                    loading={isLoading}
                    onSelectionChange={setRowSelection}
                />

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
                                {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(
                                    (num) => (
                                        <SelectItem
                                            key={num}
                                            value={num.toString()}
                                        >
                                            {num}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {lastPage > 1 && (
                        <Pagination className="flex mx-0 w-max">
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
                </div>
            </section>
        </main>
    );
}
