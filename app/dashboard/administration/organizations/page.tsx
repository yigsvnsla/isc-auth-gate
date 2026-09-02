"use client";

import { Suspense } from "react";
import { OrganizationsDataTableContainer } from "./data-table-container";
import { OrganizationsDataTableSkeleton } from "./data-table-skeleton";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  RefreshCwIcon,
  PlusIcon,
  Building2Icon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react";
import { useOrganizations } from "@/hooks/use-admin-roles";
import type { OrganizationRow } from "./columns";

function OrganizationStats() {
  const { data, isLoading } = useOrganizations();
  const organizations = (data ?? []) as unknown as OrganizationRow[];

  const totalOrgs = organizations.length;
  const ownerCount = organizations.filter((org) => org.role === "owner").length;
  const adminCount = organizations.filter((org) => org.role === "admin").length;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card className="py-4">
        <CardContent className="flex items-center gap-3 px-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Building2Icon className="size-4.5 text-primary" />
          </div>
          <div className="grid gap-0.5">
            <p className="text-xs font-medium text-muted-foreground">
              Total Organizations
            </p>
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold tabular-nums">{totalOrgs}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardContent className="flex items-center gap-3 px-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <ShieldIcon className="size-4.5 text-amber-500" />
          </div>
          <div className="grid gap-0.5">
            <p className="text-xs font-medium text-muted-foreground">Owner</p>
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold tabular-nums">{ownerCount}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardContent className="flex items-center gap-3 px-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
            <ShieldIcon className="size-4.5 text-blue-500" />
          </div>
          <div className="grid gap-0.5">
            <p className="text-xs font-medium text-muted-foreground">Admin</p>
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <p className="text-xl font-bold tabular-nums">{adminCount}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardContent className="flex items-center gap-3 px-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
            <UsersIcon className="size-4.5 text-emerald-500" />
          </div>
          <div className="grid gap-0.5">
            <p className="text-xs font-medium text-muted-foreground">
              Total Members
            </p>
            <p className="text-xl font-bold tabular-nums">N/A</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  const { mutate } = useOrganizations();

  const refreshTable = () => mutate();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Organization Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your organizations and team access
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshTable}>
            <RefreshCwIcon data-icon="inline-start" className="size-4" />
            Refresh
          </Button>
          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link href="/dashboard/administration/organizations/create">
                <PlusIcon data-icon="inline-start" className="size-4" />
                New Organization
              </Link>
            }
          />
        </div>
      </div>

      <OrganizationStats />

      <Suspense fallback={<OrganizationsDataTableSkeleton />}>
        <OrganizationsDataTableContainer />
      </Suspense>
    </div>
  );
}
