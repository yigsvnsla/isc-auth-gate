"use client";

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon, GlobeIcon } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "@/components/ui/sonner";
import { useOrganizations } from "@/hooks/use-admin-roles";
import { AuthClientsPage } from "../../../oauth/page-clients";

type OrganizationData = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: Date;
  role: string;
};

function OrgAppsContent({ orgId }: { orgId: string }) {
  const [activated, setActivated] = useState(false);
  const { data: organizations, isLoading } = useOrganizations();

  const organization = (organizations ?? []).find(
    (org) => org.id === orgId,
  ) as OrganizationData | undefined;
  const canManage =
    organization?.role === "owner" || organization?.role === "admin";

  useEffect(() => {
    if (!canManage) return;
    let cancelled = false;
    authClient.organization
      .setActive({ organizationId: orgId })
      .then(({ error }) => {
        if (cancelled) return;
        if (error) {
          toast.error(error.message ?? "No se pudo activar la organización");
        } else {
          setActivated(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [orgId, canManage]);

  if (isLoading) return <OrgAppsSkeleton />;

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <GlobeIcon className="size-12 text-muted-foreground" />
        <p className="text-lg font-medium">Organization not found</p>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/dashboard/administration/organizations" />}
        >
          <ArrowLeftIcon data-icon="inline-start" className="size-4" />
          Back to Organizations
        </Button>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <GlobeIcon className="size-12 text-muted-foreground" />
        <p className="text-lg font-medium">Acceso restringido</p>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Solo los roles owner y admin pueden gestionar las aplicaciones OAuth
          de esta organización.
        </p>
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <Link href={`/dashboard/administration/organizations/${orgId}`} />
          }
        >
          <ArrowLeftIcon data-icon="inline-start" className="size-4" />
          Volver al detalle
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon-sm"
            nativeButton={false}
            render={
              <Link href={`/dashboard/administration/organizations/${orgId}`} />
            }
          >
            <ArrowLeftIcon data-icon="inline-start" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              OAuth Apps
            </h1>
            <p className="text-sm text-muted-foreground">
              Aplicaciones de la organización{" "}
              <span className="font-medium text-foreground">
                {organization.name}
              </span>
            </p>
          </div>
        </div>
      </div>

      {activated ? (
        <AuthClientsPage />
      ) : (
        <div className="grid gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}
    </div>
  );
}

function OrgAppsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

interface OrgAppsPageProps {
  params: Promise<{ id: string }>;
}

export default function OrgAppsPage({ params }: OrgAppsPageProps) {
  const { id } = use(params);
  return (
    <Suspense fallback={<OrgAppsSkeleton />}>
      <OrgAppsContent orgId={id} />
    </Suspense>
  );
}
