"use client";

import { FC, useState } from "react";
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
import { selectListUsersAtom } from "@/atoms/select-list-users-atom";

export const UserListDataTable: FC = () => {
  const [rowSelection, setRowSelection] = useAtom(selectListUsersAtom);

  const [params] = useAtom(paramListUsersAtom);

  const { data, isLoading } = useAdminListUser(params);

  const selectedUsers = data.users.filter((user) => rowSelection[user.id]);
  const hasSelection = selectedUsers.length > 0;

  const table = useReactTable({
    columns,
    data: data.users,
    rowCount: data.total,
    manualPagination: true,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      pagination: {
        pageSize: params.pageSize,
        pageIndex: params.pageIndex,
      },
      rowSelection,
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
      {hasSelection && <UserListDataTableBatching />}

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
            {table.getRowModel().rows?.length ? (
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
