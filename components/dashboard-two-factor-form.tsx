"use client";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { RefreshCwIcon, ShieldCheckIcon } from "lucide-react";
import { Field, FieldContent, FieldDescription, FieldLabel } from "./ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./ui/input-otp";
import Link from "next/link";
import { BetterAuthError } from "better-auth";
import { cn } from "@/lib/utils";
import { Switch } from "./ui/switch";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";

type TwoFactorMethod = "totp" | "otp" | "backup";

export function DashboardTwoFactorForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const methodTwoFactor = params.get("method") as TwoFactorMethod;
  const email = params.get("email");

  if (!methodTwoFactor || !email) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldCheckIcon />
          </EmptyMedia>
          <EmptyTitle>Método de verificación inválido</EmptyTitle>
          <EmptyDescription>
            El método de autenticación de dos factores solicitado no es válido o
            ya no está disponible. Regresa al inicio de sesión e inténtalo
            nuevamente.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            nativeButton={false}
            render={<Link href="/dashboard">Volver al inicio de sesión</Link>}
            variant="outline"
            size="sm"
          />
        </EmptyContent>
      </Empty>
    );
  }

  const sendHandler = (method: TwoFactorMethod) => {
    const methods = {
      totp: (opts: { code: string; trustDevice: boolean }) =>
        authClient.twoFactor.verifyTotp(opts),

      otp: (opts: { code: string; trustDevice: boolean }) =>
        authClient.twoFactor.verifyOtp(opts),

      backup: (opts: { code: string; trustDevice: boolean }) =>
        authClient.twoFactor.verifyBackupCode({
          ...opts,
          disableSession: true,
        }),
    };

    const fetcher = async () => {
      setIsPending(true);
      const { data, error } = await methods[method]({ code, trustDevice });
      setIsPending(false);
      if (error) throw error;
      if (!data) throw new BetterAuthError("Error en solicitud de proveedor");
      return data;
    };

    return () => {
      toast.promise(fetcher, {
        loading: "Enviando código...",
        success: () => {
          router.push("/dashboard");
          return "¡Código enviado correctamente!";
        },
        error: (err) =>
          err instanceof BetterAuthError
            ? err.message
            : "No se pudo enviar el código",
      });
    };
  };

  const resendHandler = async () => {
    const fetcher = async () => {
      setIsPending(true);
      const { data, error } = await authClient.twoFactor.sendOtp({
        trustDevice: false,
      });
      setIsPending(false);
      if (error) throw error;
      if (!data) throw new BetterAuthError("Error en solicitud de proveedor");
      return data;
    };

    toast.promise(fetcher, {
      loading: "Reenviando código...",
      success: () => "¡Código reenviado correctamente!",
      error: (err) =>
        err instanceof BetterAuthError
          ? err.message
          : "No se pudo reenviar el código",
    });
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheckIcon className="size-5" />
          </div>
          <CardTitle>Verificación en dos pasos</CardTitle>
          <CardDescription>
            Enter the verification code we sent to your email address: &nbsp;
            <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="otp-verification">
                Verification code
              </FieldLabel>
              <Button
                onClick={resendHandler}
                aria-disabled={isPending}
                disabled={isPending}
                variant="outline"
                size="xs"
              >
                <RefreshCwIcon
                  className={cn({
                    "animate-spin": isPending,
                  })}
                />
                Resend Code
              </Button>
            </div>
            <InputOTP
              required
              maxLength={6}
              value={code}
              onChange={setCode}
              id="otp-verification"
              pattern={REGEXP_ONLY_DIGITS}
              containerClassName="justify-center"
              disabled={isPending}
              aria-invalid={code.length !== 6}
            >
              <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator className="mx-2" />
              <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <FieldDescription className="flex">
              <Link className="mx-auto" href="#">
                I no longer have access to this email address.
              </Link>
            </FieldDescription>
          </Field>

          <Field orientation="horizontal" className="w-fit mt-4 ml-auto">
            <FieldContent>
              <FieldLabel htmlFor="2fa">Set Trust Device</FieldLabel>
            </FieldContent>
            <Switch
              checked={trustDevice}
              onCheckedChange={setTrustDevice}
              id="2fa"
            />
          </Field>
        </CardContent>

        <CardFooter>
          <Field>
            <Button
              onClick={sendHandler(methodTwoFactor)}
              aria-disabled={isPending}
              disabled={isPending}
              type="submit"
              className="w-full"
            >
              Verify
            </Button>
            <div className="text-sm text-muted-foreground">
              Having trouble signing in?{" "}
              <Link
                href="#"
                className="underline underline-offset-4 transition-colors hover:text-primary"
              >
                Contact support
              </Link>
            </div>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
