"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheckIcon } from "lucide-react";

type Method = "totp" | "otp" | "backup";

export default function TwoFactorPage() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("totp");
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [pending, setPending] = useState(false);

  const verify = async () => {
    if (!code) {
      toast.error("Ingresa el código");
      return;
    }
    setPending(true);
    try {
      const opts = { code, trustDevice } as const;
      if (method === "totp") {
        await authClient.twoFactor.verifyTotp(opts);
      } else if (method === "otp") {
        await authClient.twoFactor.verifyOtp(opts);
      } else {
        await authClient.twoFactor.verifyBackupCode(opts);
      }
      toast.success("Verificado");
      router.push("/dashboard");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Código inválido o expirado",
      );
      setCode("");
    } finally {
      setPending(false);
    }
  };

  const sendOtp = async () => {
    try {
      await authClient.twoFactor.sendOtp();
      setOtpSent(true);
      toast.success("Código enviado a tu correo");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo enviar el código");
    }
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
            Confirma tu identidad para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="method">Método</Label>
            <select
              id="method"
              value={method}
              onChange={(e) => {
                setMethod(e.target.value as Method);
                setOtpSent(false);
                setCode("");
              }}
              className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            >
              <option value="totp">App autenticadora (TOTP)</option>
              <option value="otp">Código por correo (OTP)</option>
              <option value="backup">Código de respaldo</option>
            </select>
          </div>

          {method === "otp" && !otpSent && (
            <Button variant="outline" onClick={sendOtp} type="button">
              Enviar código a mi correo
            </Button>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="code">
              {method === "backup" ? "Código de respaldo" : "Código"}
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              autoComplete="one-time-code"
              inputMode="text"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
            />
            Confiar en este dispositivo 30 días
          </label>

          <Button onClick={verify} disabled={pending}>
            {pending ? "Verificando..." : "Verificar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}