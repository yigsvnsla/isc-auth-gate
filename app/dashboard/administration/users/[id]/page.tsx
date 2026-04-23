"use client";

import { authClient } from "@/lib/auth-client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { shortName } from "@/lib/utils";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CopyIcon,
  ListIcon,
  MailIcon,
  RefreshCcwIcon,
  UserIcon,
  UserPlus2Icon,
  UsersIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import useSWR from "swr";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { toast } from "@/components/ui/sonner";

import { format, formatDistanceToNowStrict } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { columns } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserIdPage() {
  const [copy] = useCopyToClipboard();
  const { id } = useParams<{ id: string }>();

  const userInfo = useSWR(["/admin/get-user", id], async (args) => {
    const [, userId] = args;

    return authClient.admin.getUser({
      query: {
        id: userId,
      },
      fetchOptions: {
        throw: true,
      },
    });
  });

  const sessionsInfo = useSWR(
    ["/admin/list-user-sessions", id],
    async (args) => {
      const [, userId] = args;

      return authClient.admin.listUserSessions(
        {
          userId,
        },
        {
          throw: true,
        },
      );
    },
  );

  const tableSessions = useReactTable({
    data: sessionsInfo.data?.sessions ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  function copyToClipboard(value: string) {
    return () => {
      copy(value);
      toast.success("copy to clipboard success");
    };
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center ">
        <Avatar className="size-16 ">
          <AvatarImage
            src={userInfo.data?.image || undefined}
            alt={userInfo.data?.name}
          />
          <AvatarFallback>
            {shortName(String(userInfo.data?.name))}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="scroll-m-20 text-xl xl:text-2xl font-extrabold tracking-tight text-balance">
            {userInfo.data?.name}
          </h1>
          <h4 className="text-muted-foreground/80 text-sm  scroll-m-20 xl:text-lg font-semibold tracking-tight">
            {userInfo.data?.email}
          </h4>
          <div className="flex gap-2 mt-2">
            {userInfo.isLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : userInfo.data?.banned ? (
              <Badge className="bg-destructive/10 [a&]:hover:bg-destructive/5 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive border-none focus-visible:outline-none">
                <span
                  className="bg-destructive size-1.5 rounded-full"
                  aria-hidden="true"
                />
                Blocked
              </Badge>
            ) : (
              <Badge className="border-none bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5">
                <span
                  className="size-1.5 rounded-full bg-green-600 dark:bg-green-400"
                  aria-hidden="true"
                />
                Active
              </Badge>
            )}

            {userInfo.isLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : userInfo.data?.emailVerified ? (
              <Badge
                className="capitalize ms-1 border-blue-600/30 bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                variant="outline"
              >
                <span
                  className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                  aria-hidden="true"
                />
                verified
              </Badge>
            ) : (
              <Badge className="capitalize border-none bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 focus-visible:outline-none dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5">
                <span
                  className="size-1.5 rounded-full bg-amber-600 dark:bg-amber-400"
                  aria-hidden="true"
                />
                unverified
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div>
        <Tabs defaultValue="account">
          <TabsList className="w-full xl:w-100">
            <TabsTrigger className="capitalize" value="account">
              <UserIcon />
              profile
            </TabsTrigger>
            <TabsTrigger className="capitalize" value="sessions">
              <ListIcon />
              sessions
            </TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">profile details</CardTitle>
                <CardDescription className="capitalize">
                  user information and acccount details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className=" items-start gap-3 hidden">
                    <div className="text-muted-foreground mt-0.5">
                      <UserIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">User ID</p>
                      <p className="font-medium truncate font-mono text-xs">
                        ktz636zi5eavnilpeqq3d6qu
                      </p>
                      <p className=" text-muted-foreground font-medium truncate font-mono text-xs">
                        dsadsadas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-muted-foreground mt-0.5">
                      <UserIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">
                        User Identification
                      </p>
                      <p className="font-medium truncate font-mono text-xs">
                        {userInfo.data?.id}
                      </p>
                    </div>
                    <div>
                      <Button
                        onClick={copyToClipboard(String(userInfo.data?.id))}
                        size="icon-sm"
                        variant="outline"
                      >
                        <CopyIcon />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-muted-foreground mt-0.5">
                      <MailIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="capitalize text-sm text-muted-foreground">
                        email
                      </p>
                      <p className="font-medium truncate font-mono text-xs">
                        {userInfo.data?.email}
                      </p>
                    </div>
                    <div>
                      <Button
                        onClick={copyToClipboard(String(userInfo.data?.id))}
                        size="icon-sm"
                        variant="outline"
                      >
                        <CopyIcon />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="text-muted-foreground mt-0.5">
                      <CalendarIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="capitalize text-sm text-muted-foreground">
                        created at
                      </p>
                      <p className="font-medium truncate font-mono text-xs">
                        {format(
                          userInfo.data?.createdAt || new Date(),
                          "dd/mm/yyyy - hh:mm:ss",
                        )}
                      </p>
                      <p className=" text-muted-foreground font-medium truncate font-mono text-xs">
                        {formatDistanceToNowStrict(
                          userInfo.data?.createdAt || Date.now(),
                          { addSuffix: true },
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="text-muted-foreground mt-0.5">
                      <CalendarIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="capitalize text-sm text-muted-foreground">
                        updated at
                      </p>
                      <p className="font-medium truncate font-mono text-xs">
                        {format(
                          userInfo.data?.updatedAt || new Date(),
                          "dd/mm/yyyy - hh:mm:ss",
                        )}
                      </p>
                      <p className=" text-muted-foreground font-medium truncate font-mono text-xs">
                        {formatDistanceToNowStrict(
                          userInfo.data?.updatedAt || Date.now(),
                          { addSuffix: true },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Sessions Account</CardTitle>
                <CardDescription>Lista de sesiones del usuario</CardDescription>
              </CardHeader>
              <CardContent>
                {/* TABLE */}
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      {tableSessions.getHeaderGroups().map((headerGroup) => (
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
                      {tableSessions.getRowModel().rows?.length ? (
                        tableSessions.getRowModel().rows.map((row) => (
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
                                  You&apos;re all caught up. New notifications
                                  will appear here.
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
                    {tableSessions.getFilteredSelectedRowModel().rows.length} of{" "}
                    {tableSessions.getFilteredRowModel().rows.length} row(s)
                    selected.
                  </div>
                  <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">Rows per page</p>
                      <Select
                        value={`${tableSessions.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                          tableSessions.setPageSize(Number(value));
                        }}
                      >
                        <SelectTrigger className="h-8 w-17.5">
                          <SelectValue
                            placeholder={
                              tableSessions.getState().pagination.pageSize
                            }
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
                      Page {tableSessions.getState().pagination.pageIndex + 1}{" "}
                      of {tableSessions.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 lg:flex"
                        onClick={() => tableSessions.setPageIndex(0)}
                        disabled={!tableSessions.getCanPreviousPage()}
                      >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeftIcon />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => tableSessions.previousPage()}
                        disabled={!tableSessions.getCanPreviousPage()}
                      >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeftIcon />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => tableSessions.nextPage()}
                        disabled={!tableSessions.getCanNextPage()}
                      >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRightIcon />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 lg:flex"
                        onClick={() =>
                          tableSessions.setPageIndex(
                            tableSessions.getPageCount() - 1,
                          )
                        }
                        disabled={!tableSessions.getCanNextPage()}
                      >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRightIcon />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="password">Change your password here.</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
