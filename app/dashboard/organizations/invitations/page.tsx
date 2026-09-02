"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { formatDistanceToNowStrict, format } from "date-fns";
import {
  CalendarClockIcon,
  CheckIcon,
  MailIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";
import { useUserSession } from "@/hooks/use-user-session";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { shortName } from "@/lib/utils";

interface InvitationData {
  id: string;
  email: string;
  role: string;
  status: string;
  organizationId: string;
  expiresAt: string | Date;
  organization?: {
    name: string;
    logo?: string | null;
  };
  inviter?: {
    user?: {
      name?: string | null;
      email?: string;
    };
  };
}

function InvitationSkeleton() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <Skeleton className="size-16 rounded-lg" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-56" />
        </CardContent>
        <CardFooter className="gap-2 pb-6">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </CardFooter>
      </Card>
    </div>
  );
}

function InvitationErrorState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Empty className="max-w-md">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldCheckIcon />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription className="text-pretty">
            {description}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            Ir al dashboard
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}

function InvitationContent() {
  const router = useRouter();
  const params = useSearchParams();
  const invitationId = params.get("id");

  const { data: session } = useUserSession();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const {
    data: invitation,
    error,
    isLoading,
  } = useSWR(
    invitationId ? ["invitation", invitationId] : null,
    async ([, id]) => {
      const { data, error } = await authClient.organization.getInvitation({
        query: { id },
      });
      if (error) throw new Error(error.message ?? "Invitación no encontrada");
      return data as unknown as InvitationData;
    },
    { revalidateOnFocus: false },
  );

  if (!invitationId) {
    return (
      <InvitationErrorState
        title="Invitación inválida"
        description="No se encontró el identificador de la invitación. Abre el enlace completo desde tu correo electrónico."
      />
    );
  }

  if (isLoading) return <InvitationSkeleton />;

  if (error || !invitation) {
    return (
      <InvitationErrorState
        title="Invitación no encontrada"
        description="Esta invitación no existe o fue eliminada. Solicita una nueva invitación al administrador de la organización."
      />
    );
  }

  if (session && session.user.email !== invitation.email) {
    return (
      <InvitationErrorState
        title="Invitación para otro correo"
        description={`Esta invitación fue enviada a ${invitation.email}, pero iniciaste sesión como ${session.user.email}. Cierra sesión e ingresa con la cuenta invitada.`}
      />
    );
  }

  if (invitation.status !== "pending") {
    return (
      <InvitationErrorState
        title={`Invitación ${invitation.status}`}
        description={
          invitation.status === "accepted"
            ? "Ya aceptaste esta invitación anteriormente."
            : "Esta invitación ya no está activa. Solicita una nueva invitación al administrador de la organización."
        }
      />
    );
  }

  const isExpired = new Date(invitation.expiresAt) < new Date();
  if (isExpired) {
    return (
      <InvitationErrorState
        title="Invitación expirada"
        description="El plazo para aceptar esta invitación finalizó. Solicita una nueva invitación al administrador de la organización."
      />
    );
  }

  const orgName = invitation.organization?.name ?? "la organización";
  const orgLogo = invitation.organization?.logo ?? undefined;
  const inviterName = invitation.inviter?.user?.name ?? "Un administrador";

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const { error } = await authClient.organization.acceptInvitation({
        invitationId,
      });
      if (error) throw new Error(error.message);
      toast.success(`Te uniste a ${orgName}`);
      router.push(
        `/dashboard/administration/organizations/${invitation.organizationId}`,
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo aceptar la invitación",
      );
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      const { error } = await authClient.organization.rejectInvitation({
        invitationId,
      });
      if (error) throw new Error(error.message);
      toast.info("Invitación rechazada");
      router.push("/dashboard/administration/organizations");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo rechazar la invitación",
      );
      setIsRejecting(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <Avatar className="size-16">
            <AvatarImage src={orgLogo} alt={orgName} />
            <AvatarFallback className="text-xl">
              {shortName(orgName)}
            </AvatarFallback>
          </Avatar>

          <div className="grid gap-1">
            <h1 className="text-xl font-semibold tracking-tight">
              Invitación a {orgName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {inviterName} te invitó a formar parte de esta organización
            </p>
          </div>

          <Badge variant="secondary" className="capitalize gap-1.5">
            <ShieldCheckIcon data-icon="inline-start" className="size-3.5" />
            Rol: {invitation.role}
          </Badge>

          <Separator />

          <div className="grid w-full gap-2 text-sm">
            <div className="flex items-center gap-2">
              <MailIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">Invitado:</span>
              <span className="truncate font-medium">{invitation.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarClockIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">Expira:</span>
              <span className="font-medium">
                {format(new Date(invitation.expiresAt), "MMM d, yyyy")} (
                {formatDistanceToNowStrict(new Date(invitation.expiresAt), {
                  addSuffix: true,
                })}
                )
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleReject}
            disabled={isAccepting || isRejecting}
          >
            <XIcon data-icon="inline-start" />
            Rechazar
          </Button>
          <Button
            className="w-full"
            onClick={handleAccept}
            disabled={isAccepting || isRejecting}
          >
            <CheckIcon data-icon="inline-start" />
            Aceptar invitación
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function InvitationsPage() {
  return (
    <Suspense fallback={<InvitationSkeleton />}>
      <InvitationContent />
    </Suspense>
  );
}
