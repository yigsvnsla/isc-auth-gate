"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { completeSetup, type SetupResult } from "./actions";

/**
 * Formulario de setup inicial: crea el primer admin + organización.
 *
 * ponytail: usar el server action directo con useActionState (React 19) en
 * vez de react-hook-form — 4 campos, validación nativa HTML en client y
 * Zod en server. RHF aquí es peso muerto. Si se necesitan errores
 * per-campo con live feedback, migrar a RHF como el resto de los forms.
 */
export function SetupForm({ dbOk }: { dbOk: boolean }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<SetupResult, FormData>(
    async (prev, formData) => {
      const result = await completeSetup(prev, formData);
      // Éxito (sin error): al dashboard a iniciar sesión.
      if (!result.error) {
        router.replace("/auth/sign-in");
        router.refresh();
      }
      return result;
    },
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-6 border rounded-lg p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Configuración inicial</h1>
        <p className="text-sm text-muted-foreground">
          Crea la cuenta de administrador y la organización raíz. Esta pantalla
          se desactiva automáticamente después.
        </p>
      </div>

      <Field>
        <FieldLabel htmlFor="setup-name">Nombre del administrador</FieldLabel>
        <Input id="setup-name" name="name" required autoComplete="name" placeholder="Ana Torres" />
      </Field>

      <Field>
        <FieldLabel htmlFor="setup-email">Correo electrónico</FieldLabel>
        <FieldDescription>Se usará para iniciar sesión.</FieldDescription>
        <Input
          id="setup-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@example.com"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="setup-password">Contraseña</FieldLabel>
        <Input
          id="setup-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="••••••••"
        />
        <FieldDescription>Mínimo 8 caracteres.</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="setup-org">Nombre de la organización</FieldLabel>
        <Input id="setup-org" name="organizationName" required placeholder="Integrity Solutions" />
      </Field>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending || !dbOk} className="w-full">
        {pending ? <Spinner /> : "Crear administrador"}
      </Button>
      {!dbOk && (
        <p className="text-xs text-muted-foreground">
          La base de datos no responde — completa las variables
          BETTER_AUTH_DATABASE_* y reinicia el contenedor.
        </p>
      )}
    </form>
  );
}
