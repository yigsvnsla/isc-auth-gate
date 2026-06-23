"use client";
import { AlertCircleIcon } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import z from "zod/v3";
import { Controller, useForm } from "react-hook-form";
import { useId, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { MicrosoftLoginButton } from "./MicrosoftLoginButton";
import { useSearchParams } from "next/navigation";

const signInFormSchema = z.object({
  username: z.string().min(2, {
    message: "Correo Electronico es requerido",
  }),
  password: z.string().min(2, {
    message: "Contraseña es requerida",
  }),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const searchParams = useSearchParams();
  const componentId = useId();

  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      username: "admin-1@example.com",
      password: "123456789",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: z.infer<typeof signInFormSchema>) {
    setIsSubmitting(true);
    try {
      const { error } = await authClient.signIn.email({
        email: values.username,
        password: values.password,
        callbackURL: "/dashboard",
      });
      if (error) {
        toast.error(error.message || "Error al iniciar sesión");
      }
    } catch {
      toast.error("Error al iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      {...props}
      id={`login-form-${componentId}`}
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <Image
            src="/images/isc-logo.png"
            alt="Hero Image"
            loading="eager"
            preload={true}
            width={200}
            height={200}
            decoding="sync"
          />
          <h1 className="text-2xl font-bold">Iniciar sesión</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Accede a tu cuenta para continuar
          </p>
        </div>

        {searchParams.get("code") && (
          // no es lo mejor que se me ocurra, pero es para mostrar el error en la pantalla de login

          <Alert variant="destructive" className="max-w-md">
            <AlertCircleIcon />
            <AlertTitle>
              {searchParams.get("status")} -{" "}
              {searchParams.get("statusText") || "Error de autenticación"}
            </AlertTitle>
            <AlertDescription>
              {searchParams.get("message") ||
                "Ocurrió un error al intentar iniciar sesión."}
            </AlertDescription>
          </Alert>
        )}

        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`login-form-${componentId}-email`}>
                Correo Electronico
              </FieldLabel>
              <Input
                {...field}
                required
                type="email"
                id={`login-form-${componentId}-email`}
                aria-invalid={fieldState.invalid}
                placeholder="me@example.com"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center">
                <FieldLabel htmlFor={`login-form-${componentId}-password`}>
                  Contraseña
                </FieldLabel>
                <a
                  href="#"
                  title="Coming Soon"
                  className="ml-auto text-muted-foreground text-sm underline-offset-4 hover:underline"
                >
                  ¿Perdiste tu clave?
                </a>
              </div>
              <Input
                {...field}
                required
                type="password"
                id={`login-form-${componentId}-password`}
                aria-invalid={fieldState.invalid}
                placeholder="••••••••"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button disabled={isSubmitting} type="submit" className="w-full">
          {isSubmitting ? <Spinner /> : "Ingresar"}
        </Button>

        <FieldSeparator>Continua con</FieldSeparator>
        <Field>
          <MicrosoftLoginButton />
          <FieldDescription className="text-center">
            ¿No tienes una cuenta?{" "}
             <a href="#" title="Coming Soon" className="underline underline-offset-4">
              Registrarse
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
