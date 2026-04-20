"use client";

import { authClient } from "@workspace/auth-config/lib/client";
import { FC, useState } from "react";
import useSWR from "swr";
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
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  RefreshCcwIcon,
  UserPlus2Icon,
  UsersIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@workspace/ui/components/empty";

export const UsersDataTable: FC = () => {
  // const [totalUsers, setTotalUsers] = useState(0);
  // const [totalPages, setTotalPages] = useState(0);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data } = useSWR(
    ["/admin/list-users", pagination],
    async ([, { pageIndex, pageSize }]) => {
      const listUsers = await authClient.admin.listUsers({
        fetchOptions: {
          throw: true,
        },
        query: {
          //searchValue: "some name",
          //searchField: "name",
          //searchOperator: "contains",
          limit: pageSize,
          offset: pageIndex,
          //sortBy: "name",
          //sortDirection: "desc",
          //filterField: "email",
          //filterValue: "hello@example.com",
          //filterOperator: "eq",
        },
      });

      if (!listUsers || !("limit" in listUsers)) {
        throw new Error("Lista Incompleta");
      }

      return listUsers;
    },
    {
      suspense: true,
    },
  );

  const table = useReactTable({
    columns,
    data: data.users,
    manualPagination: true,
    rowCount: data.total,
    // pageCount: totalPages,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  return (
    <>
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
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
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

// import {
//   ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   getPaginationRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { Button } from "@workspace/ui/components/button";
// import {
//   Empty,
//   EmptyContent,
//   EmptyDescription,
//   EmptyHeader,
//   EmptyMedia,
//   EmptyTitle,
// } from "@workspace/ui/components/empty";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@workspace/ui/components/table";
// import {
//   CalendarIcon,
//   RefreshCcwIcon,
//   ShieldEllipsisIcon,
//   UserPlus2Icon,
//   UsersIcon,
// } from "lucide-react";
// import { UserDataTablePagination } from "./pagination";
// import { Input } from "@workspace/ui/components/input";

// interface DataTableProps<TData, TValue> {
//   columns: ColumnDef<TData, TValue>[];
//   data: TData[];
// }

// export function UsersDataTable<TData, TValue>({
//   columns,
//   data,
// }: DataTableProps<TData, TValue>) {
//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//   });

//   return (
//     <>
//       <div className=" flex space-x-2">
//         <Input placeholder="Search users.." className="w-xs" />
//         <div></div>

//         <Button
//           variant={"outline"}
//           className="capitalize border border-dashed ml-auto"
//         >
//           <span className="sr-only md:not-sr-only">roles</span>
//           <ShieldEllipsisIcon />
//         </Button>

//         <Button variant={"secondary"} className="capitalize">
//           <span className="sr-only md:not-sr-only">created</span>
//           <CalendarIcon />
//         </Button>

//         <Button className="capitalize">
//           <span className="sr-only md:not-sr-only">new user</span>
//           <UserPlus2Icon />
//         </Button>
//       </div>

//       <div className="overflow-hidden rounded-md border">
//         <Table>
//           <TableHeader>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => {
//                   return (
//                     <TableHead key={header.id}>
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                             header.column.columnDef.header,
//                             header.getContext(),
//                           )}
//                     </TableHead>
//                   );
//                 })}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {table.getRowModel().rows?.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow
//                   key={row.id}
//                   data-state={row.getIsSelected() && "selected"}
//                 >
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id}>
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext(),
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow className="hover:bg-transparent">
//                 <TableCell colSpan={columns.length}>
//                   <Empty className="h-[calc(10*52px)]">
//                     <EmptyHeader>
//                       <EmptyMedia variant="icon">
//                         <UsersIcon />
//                       </EmptyMedia>
//                       <EmptyTitle className="capitalize">
//                         list users is empty
//                       </EmptyTitle>
//                       <EmptyDescription className="max-w-xs text-pretty">
//                         You&apos;re all caught up. New notifications will appear
//                         here.
//                       </EmptyDescription>
//                     </EmptyHeader>
//                     <EmptyContent className="grid sm:grid-cols-2 ">
//                       <Button variant="outline">
//                         <RefreshCcwIcon data-icon="inline-start" />
//                         Refresh
//                       </Button>
//                       <Button variant="secondary">
//                         <UserPlus2Icon data-icon="inline-start" />
//                         Create new User
//                       </Button>
//                     </EmptyContent>
//                   </Empty>
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//       <UserDataTablePagination table={table} />
//     </>
//   );
// }
