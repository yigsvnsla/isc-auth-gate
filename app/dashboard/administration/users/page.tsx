"use client";

import { Suspense } from "react";
import { UsersDataTableContainer } from "./data-table-container";
import { UsersDataTableSkeleton } from "./data-table-skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  UsersIcon,
  CircleCheckIcon,
  MailWarningIcon,
  BanIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon, PlusIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import useSWR from "swr";

export default function Page() {
  const { data, isLoading } = useSWR(
    "/admin/users/kpis",
    async () => {
      const listUsers = await authClient.admin.listUsers({
        fetchOptions: { throw: true },
        query: { limit: 1, offset: 0 },
      });
      return { total: listUsers.total || 0 };
    },
    { fallbackData: { total: 0 } },
  );

  const totalUsers = data?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard" />}>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard/administration" />}>
              Administration
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              User Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage authentication and access for all users
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCwIcon data-icon="inline-start" className="size-4" />
              Refresh
            </Button>
            <Button size="sm">
              <PlusIcon data-icon="inline-start" className="size-4" />
              New User
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <UsersIcon className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Users
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{totalUsers}</p>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="text-emerald-500">↑ 12%</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <CircleCheckIcon className="size-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
                <p className="text-2xl font-bold">189</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">76.5% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                <MailWarningIcon className="size-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Verification
                </p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Awaiting email confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-rose-500/10">
                <BanIcon className="size-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Banned
                </p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Account suspended
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search users by name or email..."
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
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-35">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Suspense fallback={<UsersDataTableSkeleton />}>
        <UsersDataTableContainer />
      </Suspense>
    </div>
  );
}
