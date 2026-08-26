"use client";
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/auth-client";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { useId, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { MicrosoftLoginButton } from "@/components/MicrosoftLoginButton";

const signInFormSchema = z.object({
  username: z.email(),
  password: z.string().min(2, {
    message: "Ingresa tu contraseña",
  }),
});

export function LoginForm({ className }: React.ComponentProps<"form">) {
  const id = useId();
  const searchParams = useSearchParams();
  const router = useRouter();

  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const callbackURL = searchParams.get("redirectTo") || "/dashboard";

  async function onSubmit(values: z.infer<typeof signInFormSchema>) {
    setIsSubmitting(true);
    try {
      const identifier = values.username.trim();
      const isEmail = identifier.includes("@");
      const base = {
        password: values.password,
        callbackURL,
      };
      const onSuccess = (context: {
        data?: { twoFactorRedirect?: boolean };
      }) => {
        if (context.data?.twoFactorRedirect) {
          router.push("/auth/2fa");
        }
      };
      const { error } = isEmail
        ? await authClient.signIn.email(
            { ...base, email: identifier },
            { onSuccess: onSuccess as never },
          )
        : await authClient.signIn.username(
            { ...base, username: identifier },
            { onSuccess: onSuccess as never },
          );
      if (error) {
        toast.error(error.message || "Error al iniciar sesión");
      }
    } catch {
      toast.error("Error al iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  }

  const authError = searchParams.get("code")
    ? {
        title: `${searchParams.get("status")} - ${
          searchParams.get("statusText") || "Error de autenticación"
        }`,
        description:
          searchParams.get("message") ||
          "Ocurrió un error al intentar iniciar sesión.",
      }
    : null;

  return (
    <form
      id={`login-form-${id}`}
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <Image
            src="/images/Logo-Integrity-Solutions.svg"
            alt="Logotipo de ISC Gate"
            loading="eager"
            preload={true}
            width={200}
            height={200}
            decoding="sync"
            // className="size-16"
          />
          <h1 className="text-2xl font-bold tracking-tight">Iniciar sesión</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Accede con tu cuenta institucional para continuar
          </p>
        </div>

        {authError && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <AlertCircleIcon />
            <AlertTitle>{authError.title}</AlertTitle>
            <AlertDescription>{authError.description}</AlertDescription>
          </Alert>
        )}

        <Field>
          <MicrosoftLoginButton />
          <FieldDescription className="text-center">
            Recomendado para cuentas de Microsoft 365
          </FieldDescription>
        </Field>

        <FieldSeparator>o con tu correo y contraseña</FieldSeparator>

        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`login-form-${id}-email`}>
                Correo electrónico o usuario
              </FieldLabel>
              <Input
                {...field}
                required
                type="text"
                id={`login-form-${id}-email`}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `login-form-${id}-email-error`
                    : undefined
                }
                placeholder="me@example.com o usuario"
                autoComplete="username"
              />
              {fieldState.invalid && (
                <FieldError
                  id={`login-form-${id}-email-error`}
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center">
                <FieldLabel htmlFor={`login-form-${id}-password`}>
                  Contraseña
                </FieldLabel>
                <a
                  href="#"
                  title="Próximamente"
                  className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <Input
                  {...field}
                  required
                  type={showPassword ? "text" : "password"}
                  id={`login-form-${id}-password`}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid
                      ? `login-form-${id}-password-error`
                      : undefined
                  }
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </Button>
              </div>
              {fieldState.invalid && (
                <FieldError
                  id={`login-form-${id}-password-error`}
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />

        <Button disabled={isSubmitting} type="submit" className="w-full">
          {isSubmitting ? <Spinner /> : "Ingresar"}
        </Button>

        <div className="flex flex-col gap-2 text-center text-sm">
          <a
            href="/auth/email-otp"
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            Acceder con código por correo (sin contraseña)
          </a>
          <a
            href="/auth/magic-link"
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            Acceder con enlace mágico por correo
          </a>
          <p className="mt-2 text-xs text-muted-foreground">
            ¿Necesitas una cuenta? Solicítala a tu administrador.
          </p>
        </div>
      </FieldGroup>
    </form>
  );
}
