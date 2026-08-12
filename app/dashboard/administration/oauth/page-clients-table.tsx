"use client";

import { FC, useMemo, useState } from "react";
import { useListOAuthClientsQuery } from "./list-oauth-clients-query";
import { AuthClientsTableColumns } from "./page-clients-table-columns";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  GlobeIcon,
  PlusIcon,
  RefreshCcwIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { CreateClientDialog } from "./create-oauth-client-dialog";

export const AuthClientsTable: FC = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, mutate } = useListOAuthClientsQuery();
  const rawData = useMemo(() => data ?? [], [data]);

  const filteredData = useMemo(() => {
    let filtered = rawData;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          (client.client_name ?? "")
            .toLowerCase()
            .includes(searchLower) ||
          client.client_id.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((client) => !client.disabled);
    } else if (statusFilter === "disabled") {
      filtered = filtered.filter((client) => client.disabled);
    }

    return filtered;
  }, [rawData, search, statusFilter]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleStatusFilter = (value: string | null) => {
    setStatusFilter(value ?? "all");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const paginatedData = filteredData.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize
  );

  const totalRows = filteredData.length;
  const hasData = rawData.length > 0;
  const hasResults = filteredData.length > 0;
  const isFiltering = search || statusFilter !== "all";

  const table = useReactTable({
    columns: AuthClientsTableColumns,
    data: paginatedData,
    manualPagination: true,
    rowCount: filteredData.length,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  if (isLoading) {
    return (
      <>
        {/* FILTERS */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <div className="h-10 w-full animate-pulse rounded-md border bg-muted" />
          </div>
          <div className="h-10 w-40 animate-pulse rounded-md border bg-muted" />
        </div>

        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {AuthClientsTableColumns.map((_, i) => (
                  <TableHead key={i}>
                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                    </div>
                  </TableCell>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-full max-w-[100px] animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <div className="size-8 animate-pulse rounded-md bg-muted" />
                      <div className="size-8 animate-pulse rounded-md bg-muted" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-2 py-4">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="flex items-center gap-4">
            <div className="h-8 w-[140px] animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="flex gap-2">
              <div className="size-8 rounded-md animate-pulse bg-muted" />
              <div className="size-8 rounded-md animate-pulse bg-muted" />
              <div className="size-8 rounded-md animate-pulse bg-muted" />
              <div className="size-8 rounded-md animate-pulse bg-muted" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* FILTERS */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search clients by name or ID..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
          <svg
            className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            height="1em"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
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
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!hasData ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={AuthClientsTableColumns.length}>
                  <Empty className="h-[calc(10*52px)]">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <GlobeIcon />
                      </EmptyMedia>
                      <EmptyTitle className="capitalize">
                        no oauth clients yet
                      </EmptyTitle>
                      <EmptyDescription className="max-w-xs text-pretty">
                        You don&apos;t have any OAuth clients. Create one to
                        get started.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent className="grid sm:grid-cols-2 ">
                      <Button variant="outline" onClick={() => mutate()}>
                        <RefreshCcwIcon data-icon="inline-start" />
                        Refresh
                      </Button>
                      <CreateClientDialog>
                        <Button variant="secondary">
                          <PlusIcon data-icon="inline-start" />
                          New Client
                        </Button>
                      </CreateClientDialog>
                    </EmptyContent>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : !hasResults ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={AuthClientsTableColumns.length}>
                  <Empty className="h-[calc(10*52px)]">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <GlobeIcon />
                      </EmptyMedia>
                      <EmptyTitle className="capitalize">
                        no results found
                      </EmptyTitle>
                      <EmptyDescription className="max-w-xs text-pretty">
                        No clients match your search criteria. Try adjusting
                        your filters.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent className="grid sm:grid-cols-2 ">
                      <Button
                        variant="outline"
                        onClick={() => handleSearch("")}
                      >
                        <RefreshCcwIcon data-icon="inline-start" />
                        Clear Search
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleStatusFilter("all")}
                      >
                        Clear Filters
                      </Button>
                    </EmptyContent>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
            )}
          </TableBody>
        </Table>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-2 ">
        <div className="text-muted-foreground flex-1 text-sm">
          {isFiltering ? (
            <>showing {totalRows} of {rawData.length} client(s)</>
          ) : (
            <>{rawData.length} client(s)</>
          )}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-17.5">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-25 items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
