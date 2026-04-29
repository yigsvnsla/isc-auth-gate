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
/// import { authClient } from "@workspace/auth-config/lib/client"; // Coming Soon
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
import { useId } from "react";
import useSWRMutation from "swr/mutation";
import { Spinner } from "@/components/ui/spinner";
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

  const mutation = useSWRMutation(
    "/sign-up/email",
    (_url, { arg }: { arg: z.infer<typeof signInFormSchema> }) => {
      // Coming Soon: Implement authentication
      //   return authClient.signIn.email({
      //   email: arg.username,
      //   password: arg.password,
      //   callbackURL: "/dashboard",
      // });

      // return authClient.signIn.social({
      //   provider: "microsoft",
      //   callbackURL: "/dashboard", // The URL to redirect to after the sign in
      // });
    },
  );

  async function onSubmit(values: z.infer<typeof signInFormSchema>) {
    // Coming Soon: Implement submit logic
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

        <Button disabled={mutation.isMutating} type="submit" className="w-full">
          {mutation.isMutating ? <Spinner /> : "Ingresar"}
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
