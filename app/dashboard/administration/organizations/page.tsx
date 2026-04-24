"use client";

import { Suspense } from "react";
import { OrganizationsDataTableContainer } from "./data-table-container";
import { OrganizationsDataTableSkeleton } from "./data-table-skeleton";
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
  Building2Icon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon, Plus as PlusIcon } from "lucide-react";
import useSWR from "swr";
import { authClient } from "@/lib/auth-client";

function OrganizationStats() {
  const { data } = useSWR(
    "/organization/list",
    async () => {
      const result = await authClient.organization.list();
      return result;
    }
  );

  type OrganizationData = {
    id: string;
    role: string;
  };

  const organizations: OrganizationData[] = Array.isArray(data) ? data as unknown as OrganizationData[] : [];
  const totalOrgs = organizations.length;
  const ownerCount = organizations.filter((org) => org.role === "owner").length;
  const adminCount = organizations.filter((org) => org.role === "admin").length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2Icon className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Organizations</p>
              <p className="text-2xl font-bold">{totalOrgs}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <ShieldIcon className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Owner</p>
              <p className="text-2xl font-bold">{ownerCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
              <ShieldIcon className="size-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Admin</p>
              <p className="text-2xl font-bold">{adminCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <UsersIcon className="size-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold">N/A</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            TODO: Implement member count per organization
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard" />}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard/administration" />}>Administration</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Organizations</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Organization Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage your organizations and team access
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCwIcon data-icon="inline-start" className="size-4" />
              Refresh
            </Button>
            <Button size="sm">
              <PlusIcon data-icon="inline-start" className="size-4" />
              New Organization
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <OrganizationStats />

      <Suspense fallback={<OrganizationsDataTableSkeleton />}>
        <OrganizationsDataTableContainer />
      </Suspense>
    </div>
  );
}