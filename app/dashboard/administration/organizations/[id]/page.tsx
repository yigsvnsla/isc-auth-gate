"use client";

import { Suspense, use } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2Icon,
  UsersIcon,
  ShieldIcon,
  CalendarIcon,
  MoreHorizontalIcon,
  SettingsIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import { authClient } from "@/lib/auth-client";
import { format } from "date-fns";
import { shortName } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type OrganizationData = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: Date;
  role: string;
};

function OrganizationDetailContent({ orgId }: { orgId: string }) {
  const { data, isLoading } = useSWR(
    "/organization/list",
    async () => {
      const result = await authClient.organization.list();
      return result;
    }
  );

  if (isLoading) {
    return <OrganizationDetailSkeleton />;
  }

  const organizations: OrganizationData[] = Array.isArray(data) ? (data as unknown as OrganizationData[]) : [];
  const organization = organizations.find((org) => org.id === orgId);

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Building2Icon className="size-12 text-muted-foreground" />
        <p className="text-lg font-medium">Organization not found</p>
        <Link
          href="/dashboard/administration/organizations"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        >
          <ArrowLeftIcon data-icon="inline-start" className="size-4" />
          Back to Organizations
        </Link>
      </div>
    );
  }

  const roleConfig = {
    owner: { className: "bg-primary/10 text-primary border-primary/20" },
    admin: { className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    member: { className: "text-muted-foreground" },
  };
  const config = roleConfig[organization.role as keyof typeof roleConfig] || roleConfig.member;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/administration/organizations"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon data-icon="inline-start" className="size-4" />
          Back to Organizations
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" />}>
            <MoreHorizontalIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem>
              <SettingsIcon data-icon="inline-start" className="size-4" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={organization.logo || undefined} alt={organization.name} />
              <AvatarFallback className="text-xl">{shortName(organization.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{organization.name}</h1>
                <Badge className={`capitalize gap-1.5 ${config.className}`}>
                  <ShieldIcon className="size-3.5" data-icon="inline-start" />
                  {organization.role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">/{organization.slug}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span>{format(organization.createdAt, "MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <UsersIcon className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Members:</span>
            <span>N/A</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ShieldIcon className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Your Role:</span>
            <span className="capitalize">{organization.role}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            TODO: Implement member list for this organization.
            <br />
            API: authClient.organization.listMembers(&#123; organizationId &#125;)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            TODO: Implement pending invitations list.
            <br />
            API: authClient.organization.listInvitations(&#123; organizationId &#125;)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function OrganizationDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-9 w-48" />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

interface OrganizationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrganizationDetailPage({ params }: OrganizationDetailPageProps) {
  const resolvedParams = { id: "" };
  
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
            <BreadcrumbLink render={<Link href="/dashboard/administration/organizations" />}>Organizations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Suspense fallback={<OrganizationDetailSkeleton />}>
        <OrganizationDetailWrapper params={params} />
      </Suspense>
    </div>
  );
}

function OrganizationDetailWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OrganizationDetailContent orgId={id} />;
}