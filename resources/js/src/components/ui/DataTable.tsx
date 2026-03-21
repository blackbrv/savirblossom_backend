import React, { forwardRef, useImperativeHandle } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    RowSelectionState,
} from "@tanstack/react-table";

export interface DataTableRef {
    resetRowSelection: () => void;
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    loading?: boolean;
    onSelectionChange?: (selection: RowSelectionState) => void;
}

function DataTableInner<TData, TValue>(
    {
        columns,
        data,
        loading = false,
        onSelectionChange,
    }: DataTableProps<TData, TValue>,
    ref: React.Ref<DataTableRef>,
) {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
        {},
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: { rowSelection },
        enableRowSelection: true,
        onRowSelectionChange: (updater) => {
            const newSelection =
                typeof updater === "function" ? updater(rowSelection) : updater;
            setRowSelection(newSelection);
            onSelectionChange?.(newSelection);
        },
    });

    useImperativeHandle(
        ref,
        () => ({
            resetRowSelection: () => table.resetRowSelection(),
        }),
        [table],
    );

    return (
        <div className="overflow-hidden rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                Loading ...
                            </TableCell>
                        </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

const DataTable = forwardRef(DataTableInner);

export default DataTable;
