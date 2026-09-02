"use client";

import { useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { UserPlusIcon } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth/auth-client";

const emailSchema = z.string().email("Email inválido");

const roles = [
  { label: "Member", value: "member", description: "Acceso básico" },
  {
    label: "Admin",
    value: "admin",
    description: "Gestiona miembros e invitaciones",
  },
  {
    label: "Owner",
    value: "owner",
    description: "Control total de la organización",
  },
];

interface InviteMemberDialogProps {
  organizationId: string;
  organizationName: string;
  onSuccess?: () => void;
  children: React.ReactElement;
}

export const InviteMemberDialog = ({
  organizationId,
  organizationName,
  onSuccess,
  children,
}: InviteMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setEmail("");
      setRole("member");
      setEmailError(null);
      setIsPending(false);
    }
  };

  const handleInvite = async () => {
    const parsed = emailSchema.safeParse(email.trim());
    if (!parsed.success) {
      setEmailError(parsed.error.issues[0]?.message ?? "Email inválido");
      return;
    }
    setEmailError(null);
    setIsPending(true);

    try {
      await authClient.organization.inviteMember({
        email: parsed.data,
        role,
        organizationId,
        fetchOptions: { throw: true },
      });
      toast.success(`Invitación enviada a ${parsed.data}`);
      onSuccess?.();
      handleOpenChange(false);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo enviar la invitación",
      );
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitar a {organizationName}</DialogTitle>
          <DialogDescription>
            Enviaremos un correo con el enlace para unirse a la organización.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field data-invalid={Boolean(emailError)}>
            <FieldLabel htmlFor="invite-member-email">Email</FieldLabel>
            <Input
              id="invite-member-email"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              aria-invalid={Boolean(emailError)}
              disabled={isPending}
            />
            {emailError && <FieldError>{emailError}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="invite-member-role">Rol</FieldLabel>
            <Select
              value={role}
              onValueChange={(value) => setRole(value ?? "member")}
            >
              <SelectTrigger
                id="invite-member-role"
                disabled={isPending}
                className="w-full"
              >
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger>
                <SelectGroup>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      <div className="grid gap-0.5">
                        <span>{r.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {r.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription>
              Podrá cambiar después desde la lista de miembros.
            </FieldDescription>
          </Field>
        </FieldGroup>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancelar
          </DialogClose>
          <Button onClick={handleInvite} disabled={isPending || !email.trim()}>
            {isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                Enviando...
              </>
            ) : (
              <>
                <UserPlusIcon data-icon="inline-start" />
                Enviar invitación
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
