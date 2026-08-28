"use client";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/auth-client";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { useId, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { MicrosoftLoginButton } from "./button-login-microsoft";
import { BetterFetchError } from "better-auth/react";
import { BetterAuthError } from "better-auth";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import z from "zod";
import Image from "next/image";
import Link from "next/link";
import useSWRMutation from "swr/mutation";
import type { SuccessContext } from "@better-fetch/fetch";


// El twoFactorClient inyecta estos campos a runtime
type TwoFactorAugmented = SignInEmailResponse & {
  twoFactorRedirect?: boolean;
  twoFactorMethods?: string[];
};

const dashboardSignInSchema = z.object({
  username: z.email(),
  password: z.string().min(2, {
    message: "Ingresa tu contraseña",
  }),

  remember:z.boolean()
});

export type SingInFormSchema = z.infer<typeof dashboardSignInSchema>

export type SignInEmail = Parameters<typeof authClient.signIn.email>[0];

export type SignInEmailResponse = Awaited<ReturnType<typeof authClient.signIn.email<never>>>;

export interface SignInEmailArg {
  arg: SignInEmail;
}

export const key = "/sign-in/email"

export const fetcher = async (_key: string, { arg }: SignInEmailArg) => {
  const { data, error } = await authClient.signIn.email(arg);
  if (error) throw error;
  if (!data) throw new BetterAuthError("Error en solicitud de proveedor")
  return data;
};

export const useSignInEmailMutation = () => {
  return useSWRMutation<NonNullable<SignInEmailResponse>, BetterFetchError, typeof key, SignInEmail>(key, fetcher);
};  

export function DashboardLoginForm({ className }: React.ComponentProps<"form">) {
  const id = useId();
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);
  const { trigger, isMutating } = useSignInEmailMutation();

  const form = useForm<SingInFormSchema>({
    resolver: zodResolver(dashboardSignInSchema),
    defaultValues: {
      username: "user@example.com",
      password: "12345678",
      remember: false
    },
  });

  async function submitHandler(value: SingInFormSchema) {
    toast.promise(
      trigger({
        email:value.username,
        password:value.password,
        rememberMe: value.remember,
        fetchOptions:{
          onSuccess: async (ctx: SuccessContext<TwoFactorAugmented>) => {
            if (ctx.data.twoFactorRedirect) { 
              const {data, error} = await authClient.twoFactor.sendOtp();
              if (error) throw error;
              if (!data) throw new BetterAuthError("Error en solicitud de proveedor")
              router.push("/dashboard/2fa");
            }
          }
        }
      }),
      {
        loading: "Iniciando sesión...",
        success: () => {
          // 3. Ejecutar la redirección programática al resolverse el popup

          return "¡Sesión iniciada correctamente!";
        },
        error: (err) => `Error al iniciar sesión: ${err.message || err}`,
      },
    );
  }

  return (
    <form
      id={`dashboard-login-form-${id}`}
      onSubmit={form.handleSubmit(submitHandler)}
      className={cn("flex flex-col gap-6", className)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <Image
            src="/images/isc-logo.png"
            alt="Logotipo de ISC Gate"
            loading="eager"
            preload={true}
            width={200}
            height={200}
            decoding="sync"
            className="size-16"
          />
          <h1 className="text-2xl font-bold tracking-tight">Iniciar sesión</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Accede al panel de administración
          </p>
        </div>

        <Field>
          <MicrosoftLoginButton disabled={isMutating} />
          <FieldDescription className="text-center">
            Recomendado para cuentas de Microsoft 365
          </FieldDescription>
        </Field>

        <FieldSeparator className="bg-none ">
          o con tu correo y contraseña
        </FieldSeparator>

        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`dashboard-login-form-${id}-email`}>
                Correo electrónico
              </FieldLabel>
              <Input
                {...field}
                required
                type="text"
                id={`dashboard-login-form-${id}-email`}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `dashboard-login-form-${id}-email-error`
                    : undefined
                }
                placeholder="me@example.com"
                autoComplete="email"
              />
              {fieldState.invalid && (
                <FieldError
                  id={`dashboard-login-form-${id}-email-error`}
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
            <Field className="max-w-sm" data-invalid={fieldState.invalid}>
              <div className="flex flex-row justify-between">
                <FieldLabel htmlFor={`dashboard-login-form-${id}-password`}>
                  Contraseña
                </FieldLabel>
                <Link
                  href="#"
                  title="Próximamente"
                  className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  required
                  type={showPassword ? "text" : "password"}
                  id={`dashboard-login-form-${id}-password`}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.invalid ? `dashboard-login-form-${id}-password-error`: undefined}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    title="view password"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOffIcon /> :<EyeIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && (
                <FieldError
                   id={`dashboard-login-form-${id}-password-error`}
                   errors={[fieldState.error]}
                 />
               )}
            </Field>
          )}
        />

        <Button disabled={isMutating} type="submit" className="w-full">
          {isMutating ? <Spinner /> : "Ingresar al panel"}
        </Button>

        <div className="flex flex-col gap-2 text-center text-sm">
          <Link
            href="/auth/email-otp"
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            Acceder con código por correo (sin contraseña)
          </Link>
          <Link
            href="/auth/magic-link"
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            Acceder con enlace mágico por correo
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">
            ¿Necesitas una cuenta? Solicítala a tu administrador.
          </p>
        </div>
      </FieldGroup>
    </form>
  );
}
