"use client";

import { FC } from "react";
import { useListResourcesQuery } from "./list-resources-query";
import { AuthResourcesTableColumns } from "./page-resources-table-columns";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { PlusIcon, RefreshCcwIcon, ServerCogIcon } from "lucide-react";
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
import { CreateResourceDialog } from "./create-resource-dialog";

export const AuthResourcesTable: FC = () => {
  const { data, isLoading, mutate } = useListResourcesQuery();
  const resources = data ?? [];

  const table = useReactTable({
    columns: AuthResourcesTableColumns,
    data: resources,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {AuthResourcesTableColumns.map((_, i) => (
                <TableHead key={i}>
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                {AuthResourcesTableColumns.map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {resources.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={AuthResourcesTableColumns.length}>
                <Empty className="h-[calc(10*52px)]">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ServerCogIcon />
                    </EmptyMedia>
                    <EmptyTitle className="capitalize">
                      no resources yet
                    </EmptyTitle>
                    <EmptyDescription className="max-w-xs text-pretty">
                      Registra una API protegida (RFC 8707) para emitir tokens
                      con su identifier en el claim <code>aud</code>.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent className="grid sm:grid-cols-2">
                    <Button variant="outline" onClick={() => mutate()}>
                      <RefreshCcwIcon data-icon="inline-start" />
                      Refresh
                    </Button>
                    <CreateResourceDialog>
                      <Button variant="secondary">
                        <PlusIcon data-icon="inline-start" />
                        New Resource
                      </Button>
                    </CreateResourceDialog>
                  </EmptyContent>
                </Empty>
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};