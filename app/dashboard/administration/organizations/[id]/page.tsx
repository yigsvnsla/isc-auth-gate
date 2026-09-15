"use client";

import { Suspense, use, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2Icon,
  UsersIcon,
  ShieldIcon,
  CalendarIcon,
  ArrowLeftIcon,
  XIcon,
  UserPlusIcon,
  Trash2Icon,
  GlobeIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { InviteMemberDialog } from "../invite-member-dialog";
import { useOrganizations } from "@/hooks/use-admin-roles";
import { authClient } from "@/lib/auth/auth-client";
import useSWR from "swr";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { shortName } from "@/lib/utils";

type OrganizationData = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: Date;
  role: string;
};

type MemberData = {
  id: string;
  userId: string;
  role: string;
  createdAt: string | Date;
  user?: {
    name?: string | null;
    email?: string;
    image?: string | null;
  };
};

type InvitationRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string | Date;
};

const roleBadgeClass = {
  owner: "bg-primary/10 text-primary border-primary/20",
  admin: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  member: "text-muted-foreground",
} as const;

function RoleBadge({ role }: { role: string }) {
  const config =
    roleBadgeClass[role as keyof typeof roleBadgeClass] ||
    roleBadgeClass.member;
  return (
    <Badge className={`capitalize gap-1.5 w-fit ${config}`}>
      <ShieldIcon data-icon="inline-start" className="size-3.5" />
      {role}
    </Badge>
  );
}

function useOrgMembers(orgId: string) {
  return useSWR(
    ["org-members", orgId],
    async ([, organizationId]) => {
      const { data, error } = await authClient.organization.listMembers({
        query: { organizationId },
      });
      if (error)
        throw new Error(error.message ?? "No se pudieron cargar los miembros");
      return (data?.members ?? []) as unknown as MemberData[];
    },
    { revalidateOnFocus: false },
  );
}

function useOrgInvitations(orgId: string) {
  return useSWR(
    ["org-invitations", orgId],
    async ([, organizationId]) => {
      const { data, error } = await authClient.organization.listInvitations({
        query: { organizationId },
      });
      if (error)
        throw new Error(
          error.message ?? "No se pudieron cargar las invitaciones",
        );
      return (data ?? []) as unknown as InvitationRow[];
    },
    { revalidateOnFocus: false },
  );
}

function MembersCard({
  orgId,
  canManage,
}: {
  orgId: string;
  canManage: boolean;
}) {
  const { data: members, error, isLoading, mutate } = useOrgMembers(orgId);
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);

  const handleRoleChange = async (memberId: string, role: string) => {
    setPendingMemberId(memberId);
    try {
      await authClient.organization.updateMemberRole({
        memberId,
        role,
        organizationId: orgId,
        fetchOptions: { throw: true },
      });
      toast.success("Rol actualizado");
      mutate();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo actualizar el rol",
      );
    } finally {
      setPendingMemberId(null);
    }
  };

  const handleRemove = async (memberId: string) => {
    setPendingMemberId(memberId);
    try {
      await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
        organizationId: orgId,
        fetchOptions: { throw: true },
      });
      toast.success("Miembro eliminado");
      mutate();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo eliminar el miembro",
      );
    } finally {
      setPendingMemberId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UsersIcon className="size-4 text-muted-foreground" />
          Members
          {!isLoading && !error && (
            <Badge variant="secondary" className="tabular-nums">
              {members?.length ?? 0}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Personas con acceso a esta organización
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="grid flex-1 gap-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">
            No tienes acceso a la lista de miembros de esta organización.
          </p>
        ) : !members?.length ? (
          <p className="text-sm text-muted-foreground">
            Esta organización no tiene miembros.
          </p>
        ) : (
          <div className="grid gap-3">
            {members.map((member) => {
              const isPendingRow = pendingMemberId === member.id;
              return (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarImage
                      src={member.user?.image ?? undefined}
                      alt={member.user?.name ?? "Miembro"}
                    />
                    <AvatarFallback>
                      {shortName(
                        member.user?.name ?? member.user?.email ?? "?",
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 flex-1 gap-0.5">
                    <span className="truncate text-sm font-medium leading-none">
                      {member.user?.name ?? "Sin nombre"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {member.user?.email ?? "—"}
                    </span>
                  </div>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {format(new Date(member.createdAt), "MMM d, yyyy")}
                  </span>
                  {canManage ? (
                    <>
                      <Select
                        value={member.role}
                        onValueChange={(role) =>
                          handleRoleChange(member.id, role ?? member.role)
                        }
                        disabled={isPendingRow}
                      >
                        <SelectTrigger
                          size="sm"
                          className="w-28 capitalize"
                          aria-label={`Rol de ${member.user?.name ?? "miembro"}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger>
                          <SelectGroup>
                            {["member", "admin", "owner"].map((role) => (
                              <SelectItem
                                key={role}
                                value={role}
                                className="capitalize"
                              >
                                {role}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:text-destructive"
                              disabled={isPendingRow}
                              aria-label={`Eliminar a ${member.user?.name ?? "miembro"}`}
                            />
                          }
                        >
                          <Trash2Icon className="size-4" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Eliminar a{" "}
                              {member.user?.name ?? member.user?.email}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Perderá el acceso a esta organización de
                              inmediato. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isPendingRow}>
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={isPendingRow}
                              onClick={() => handleRemove(member.id)}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <RoleBadge role={member.role} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InvitationsCard({
  orgId,
  orgName,
  canManage,
}: {
  orgId: string;
  orgName: string;
  canManage: boolean;
}) {
  const {
    data: invitations,
    error,
    isLoading,
    mutate,
  } = useOrgInvitations(orgId);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (invitationId: string) => {
    setCancellingId(invitationId);
    try {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId,
      });
      if (error) throw new Error(error.message);
      toast.success("Invitación cancelada");
      mutate();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo cancelar la invitación",
      );
    } finally {
      setCancellingId(null);
    }
  };

  const statusBadge = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    accepted: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    cancelled: "text-muted-foreground",
    rejected: "text-muted-foreground",
  } as const;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="grid gap-1.5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlusIcon className="size-4 text-muted-foreground" />
              Invitaciones
              {!isLoading && !error && (
                <Badge variant="secondary" className="tabular-nums">
                  {invitations?.length ?? 0}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Invitaciones enviadas por correo electrónico
            </CardDescription>
          </div>
          {canManage && (
            <InviteMemberDialog
              organizationId={orgId}
              organizationName={orgName}
              onSuccess={mutate}
            >
              <Button size="sm">
                <UserPlusIcon data-icon="inline-start" />
                Invitar
              </Button>
            </InviteMemberDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="grid flex-1 gap-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">
            No tienes acceso a la lista de invitaciones de esta organización.
          </p>
        ) : !invitations?.length ? (
          <p className="text-sm text-muted-foreground">
            No hay invitaciones enviadas.
          </p>
        ) : (
          <div className="grid gap-3">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback>{shortName(invitation.email)}</AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 gap-0.5">
                  <span className="truncate text-sm font-medium leading-none">
                    {invitation.email}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Expira{" "}
                    {format(new Date(invitation.expiresAt), "MMM d, yyyy")}
                  </span>
                </div>
                <Badge
                  className={`capitalize gap-1.5 w-fit ${
                    statusBadge[
                      invitation.status as keyof typeof statusBadge
                    ] ?? statusBadge.rejected
                  }`}
                >
                  {invitation.status}
                </Badge>
                {invitation.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => handleCancel(invitation.id)}
                    disabled={cancellingId === invitation.id}
                    aria-label="Cancelar invitación"
                  >
                    <XIcon className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OrganizationDetailContent({ orgId }: { orgId: string }) {
  const { data: organizations, isLoading } = useOrganizations();

  if (isLoading) {
    return <OrganizationDetailSkeleton />;
  }

  const organization = (organizations ?? []).find((org) => org.id === orgId) as
    OrganizationData | undefined;

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Building2Icon className="size-12 text-muted-foreground" />
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

  const canManage =
    organization.role === "owner" || organization.role === "admin";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/administration/organizations"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon data-icon="inline-start" className="size-4" />
          Back to Organizations
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link
                href={`/dashboard/administration/organizations/${orgId}/roles`}
              />
            }
          >
            <ShieldIcon data-icon="inline-start" />
            Manage Roles
          </Button>
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link
                  href={`/dashboard/administration/organizations/${orgId}/apps`}
                />
              }
            >
              <GlobeIcon data-icon="inline-start" />
              OAuth Apps
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage
                src={organization.logo || undefined}
                alt={organization.name}
              />
              <AvatarFallback className="text-xl">
                {shortName(organization.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {organization.name}
                </h1>
                <RoleBadge role={organization.role} />
              </div>
              <p className="text-sm text-muted-foreground">
                /{organization.slug}
              </p>
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
            <span>Ver lista abajo</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ShieldIcon className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Your Role:</span>
            <span className="capitalize">{organization.role}</span>
          </div>
        </CardContent>
      </Card>

      <MembersCard orgId={orgId} canManage={canManage} />

      <InvitationsCard
        orgId={orgId}
        orgName={organization.name}
        canManage={canManage}
      />
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

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="grid gap-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

interface OrganizationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrganizationDetailPage({
  params,
}: OrganizationDetailPageProps) {
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
            <BreadcrumbLink
              render={<Link href="/dashboard/administration/organizations" />}
            >
              Organizations
            </BreadcrumbLink>
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

function OrganizationDetailWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <OrganizationDetailContent orgId={id} />;
}
