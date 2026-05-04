"use client";

import React, { FC, useEffect, useState } from "react";
import { columns } from "./data-table-columns";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useAdminListUser } from "@/hooks/adminListUsers";
import { paramListUsersAtom } from "@/atoms/params-list-users-atom";
import { useAtom } from "jotai";
import { UserListDataTableEmpty } from "./data-table-empty";
import { UserListDataTableBatching } from "./data-table-batching";
import { selectListUsersAtom, useSelectListUsers } from "@/atoms/select-list-users-atom";
import { Checkbox } from "@/components/ui/checkbox";

const SelectCell = React.memo(function SelectCell({ id }: { id: string }){
  const value = useSelectListUsers((state) => state.values[id]);
  const setRowSelection = useSelectListUsers((state) => state.setRowSelection);
  const hasExistingSelection = useSelectListUsers((state) => state.hasExistingSelection);
  useEffect(() => {
    if (hasExistingSelection(id)) return;
    setRowSelection(id, false);
  }, [id, hasExistingSelection, setRowSelection]);
  return ( <Checkbox
        checked={!!value}
        onCheckedChange={(value) => setRowSelection(id, !!value)}
        aria-label="Select row"
      />)
} )

const SelectHasOrAllSelection = React.memo(function SelectHasOrAllSelection(){
  const values = useSelectListUsers((state) => state.values);
  const setRowsSelection = useSelectListUsers((state) => state.setRowsSelection);

  const entries = Object.values(values);
  const someSelected = entries.some((v) => v);
  const allSelected = entries.length > 0 && entries.every((v) => v);

  return ( <Checkbox
        checked={allSelected ? true : someSelected ? "indeterminate" : false}
        onCheckedChange={() => setRowsSelection((prev) => {
          const newValues: typeof prev = {};
          const shouldSelectAll = !allSelected;
          for (const key in prev) {
            newValues[key] = shouldSelectAll;
          }
          return newValues;
        })}
        aria-label="Select all"
      />)
} )
export const UserListDataTable: FC = () => {

  const [params] = useAtom(paramListUsersAtom);

  const { data, isLoading } = useAdminListUser(params);

  const table = useReactTable({
    columns,
    data: data.users,
    rowCount: data.total,
    manualPagination: true,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination: {
        pageSize: params.pageSize,
        pageIndex: params.pageIndex,
      },
    },
  });

  if (isLoading) {
    return (
      <>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((_, i) => (
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
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg animate-pulse bg-muted" />
                      <div className="grid gap-1">
                        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-36 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  </TableCell>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-full max-w-25 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-2 py-4">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="flex items-center gap-4">
            <div className="h-8 w-35 animate-pulse rounded bg-muted" />
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
      {/* BATCH ACTIONS TOOLBAR */}
      <UserListDataTableBatching />

      {/* TABLE */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                   if (header.id === "select") {
                    return (
                      <TableHead key={header.id} className="w-10 px-0">
                        <SelectHasOrAllSelection />
                      </TableHead>
                    );
                  }
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map(function Cell(cell) {
                    if (cell.column.id === "select") {
                      const rowID = row.original.id;
                      
                      return (
                        <TableCell key={cell.id}>
                          <SelectCell id={rowID} />
                        </TableCell>
                      );
                    }
                    return (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  )})}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length}>
                  <UserListDataTableEmpty />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
