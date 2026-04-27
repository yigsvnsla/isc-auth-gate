"use client";

import { authClient } from "@/lib/auth-client";
import { FC, useState, useCallback, useTransition } from "react";
import useSWR, { mutate } from "swr";
import { columns } from "./columns";
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
  RefreshCcwIcon,
  UserPlus2Icon,
  UsersIcon,
  BanIcon,
  Trash2Icon,
  CheckCircleIcon,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";

export const UsersDataTable: FC = () => {


  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  const { data, isLoading } = useSWR(
    ["/admin/list-users", pagination],
    async ([, { pageIndex, pageSize }]) => {
      const listUsers = await authClient.admin.listUsers({
        fetchOptions: {
          throw: true,
        },
        query: {
          limit: pageSize,
          offset: pageIndex * pageSize,
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      });

      if (!listUsers || !("limit" in listUsers)) {
        throw new Error("Lista Incompleta");
      }

      return listUsers;
    },
    {
      fallbackData: { users: [], total: 0, limit: 10, offset: 0 },
      keepPreviousData: true,
    },
  );

  const totalPages = Math.ceil((data.total || 0) / pagination.pageSize);
  const canPreviousPage = pagination.pageIndex > 0;
  const canNextPage =
    pagination.pageIndex < totalPages - 1 &&
    data.users.length === pagination.pageSize;

  const selectedUsers = data.users.filter((user) => rowSelection[user.id]);
  const selectedCount = selectedUsers.length;
  const hasSelection = selectedCount > 0;

  const handleBatchAction = useCallback(
    async (action: "ban" | "unban" | "delete", userIds: string[]) => {
      toast.promise(
        (async () => {
          const promises = userIds.map((userId) => {
            if (action === "ban") {
              return authClient.admin.banUser({ userId });
            } else if (action === "unban") {
              return authClient.admin.unbanUser({ userId });
            } else {
              return authClient.admin.removeUser({ userId });
            }
          });
          await Promise.all(promises);
          startTransition(() => {
            setRowSelection({});
            mutate(["/admin/list-users", pagination]);
          });
        })(),
        {
          loading: `${action === "ban" ? "Baneando" : action === "unban" ? "Activando" : "Eliminando"} ${userIds.length} usuario(s)...`,
          success: `${userIds.length} usuario(s) ${action === "ban" ? "baneado(s)" : action === "unban" ? "activado(s)" : "eliminado(s)"}`,
          error: "Error al realizar la operación",
        },
      );
    },
    [pagination],
  );

  const table = useReactTable({
    columns,
    data: data.users,
    manualPagination: true,
    rowCount: data.total,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      pagination,
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
      {hasSelection && (
        <div className="mb-2 flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2">
          <span className="text-sm font-medium">
            <CheckCircleIcon className="mr-2 inline-block size-4" />
            {selectedCount} usuario(s) seleccionado(s)
          </span>
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <BanIcon className="size-4" />
                    Banear
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Banear {selectedCount} usuario(s)?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Los usuarios seleccionados no podrán iniciar sesión hasta
                    que sean aktivados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      handleBatchAction(
                        "ban",
                        selectedUsers.map((u) => u.id),
                      )
                    }
                  >
                    Banear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <CheckCircleIcon className="size-4" />
                    Activar
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Activar {selectedCount} usuario(s)?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Se removerá el bloqueo de los usuarios seleccionados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      handleBatchAction(
                        "unban",
                        selectedUsers.map((u) => u.id),
                      )
                    }
                  >
                    Activar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2Icon className="size-4" />
                    Eliminar
                  </Button>
                }
              />

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Eliminar {selectedCount} usuario(s)?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción es irreversible. Los usuarios serán eliminados
                    permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      handleBatchAction(
                        "delete",
                        selectedUsers.map((u) => u.id),
                      )
                    }
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

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
                  <Empty className="h-[calc(10*52px)]">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <UsersIcon />
                      </EmptyMedia>
                      <EmptyTitle className="capitalize">
                        list users is empty
                      </EmptyTitle>
                      <EmptyDescription className="max-w-xs text-pretty">
                        You&apos;re all caught up. New notifications will appear
                        here.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent className="grid sm:grid-cols-2 ">
                      <Button variant="outline">
                        <RefreshCcwIcon data-icon="inline-start" />
                        Refresh
                      </Button>
                      <Button variant="secondary">
                        <UserPlus2Icon data-icon="inline-start" />
                        Create new User
                      </Button>
                    </EmptyContent>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-2 ">
        <div className="text-muted-foreground flex-1 text-sm">
          {data.total} total usuario(s)
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(value) => {
                setPagination((prev) => ({
                  ...prev,
                  pageSize: Number(value),
                  pageIndex: 0,
                }));
              }}
            >
              <SelectTrigger className="h-8 w-17.5">
                <SelectValue placeholder={pagination.pageSize} />
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
            Page {pagination.pageIndex + 1} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() =>
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }
              disabled={!canPreviousPage}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex - 1,
                }))
              }
              disabled={!canPreviousPage}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: prev.pageIndex + 1,
                }))
              }
              disabled={!canNextPage}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: totalPages - 1,
                }))
              }
              disabled={!canNextPage}
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
