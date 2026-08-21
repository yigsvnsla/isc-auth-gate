"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheckIcon, ShieldOffIcon } from "lucide-react";
import QRCode from "react-qr-code";

export default function SecuritySettingsPage() {
  const { data: session } = authClient.useSession();
  const twoFactorEnabled = session?.user?.twoFactorEnabled ?? false;

  const [password, setPassword] = useState("");
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState("");
  const [pending, setPending] = useState(false);

  const startEnable = async () => {
    if (!password) {
      toast.error("Ingresa tu contraseña");
      return;
    }
    setPending(true);
    try {
      const { data, error } = await authClient.twoFactor.enable({ password });
      if (error) {
        toast.error(error.message || "No se pudo iniciar 2FA");
        return;
      }
      if (data?.method === "totp") {
        setTotpURI(data.totpURI ?? null);
        setBackupCodes(data.backupCodes ?? []);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al activar 2FA");
    } finally {
      setPending(false);
    }
  };

  const confirmEnable = async () => {
    if (!verifyCode) {
      toast.error("Escanea el QR e ingresa el código TOTP");
      return;
    }
    setPending(true);
    try {
      await authClient.twoFactor.verifyTotp({ code: verifyCode, trustDevice: true });
      toast.success("2FA activado correctamente");
      setTotpURI(null);
      setBackupCodes([]);
      setVerifyCode("");
      setPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setPending(false);
    }
  };

  const disable = async () => {
    if (!password) {
      toast.error("Ingresa tu contraseña");
      return;
    }
    setPending(true);
    try {
      const { error } = await authClient.twoFactor.disable({ password });
      if (error) {
        toast.error(error.message || "No se pudo desactivar 2FA");
        return;
      }
      toast.success("2FA desactivado");
      setPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al desactivar 2FA");
    } finally {
      setPending(false);
    }
  };

  const regenerate = async () => {
    if (!password) {
      toast.error("Ingresa tu contraseña");
      return;
    }
    setPending(true);
    try {
      const { data, error } = await authClient.twoFactor.generateBackupCodes({
        password,
      });
      if (error) {
        toast.error(error.message || "No se pudieron regenerar los códigos");
        return;
      }
      setBackupCodes(data?.backupCodes ?? []);
      toast.success("Códigos de respaldo regenerados");
      setPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al regenerar");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Seguridad</h1>
        <p className="text-muted-foreground text-sm">
          Autenticación en dos pasos (2FA) para tu cuenta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {twoFactorEnabled ? (
              <ShieldCheckIcon className="size-5 text-primary" />
            ) : (
              <ShieldOffIcon className="size-5" />
            )}
            Verificación en dos pasos
          </CardTitle>
          <CardDescription>
            Estado:{" "}
            {twoFactorEnabled ? (
              <Badge variant="secondary">Activo</Badge>
            ) : (
              <Badge variant="outline">Inactivo</Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!twoFactorEnabled && !totpURI && (
            <>
              <p className="text-sm text-muted-foreground">
                Activa 2FA para proteger tu cuenta con una app autenticadora
                (TOTP). También puedes usar códigos por correo y códigos de
                respaldo.
              </p>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pwd-enable">Contraseña</Label>
                <Input
                  id="pwd-enable"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                />
              </div>
              <Button onClick={startEnable} disabled={pending}>
                {pending ? "Procesando..." : "Activar 2FA"}
              </Button>
            </>
          )}

          {totpURI && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-sm font-medium">
                  1. Escanea este código QR en tu app autenticadora:
                </p>
                <div className="w-48 rounded-md border bg-white p-2">
                  <QRCode value={totpURI} size={176} />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">
                  2. Guarda tus códigos de respaldo (uso único):
                </p>
                <ul className="grid grid-cols-2 gap-1 rounded-md border p-3 font-mono text-xs">
                  {backupCodes.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="totp-verify">
                  3. Ingresa el código de la app para confirmar
                </Label>
                <Input
                  id="totp-verify"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="123456"
                  inputMode="text"
                />
              </div>
              <Button onClick={confirmEnable} disabled={pending}>
                {pending ? "Verificando..." : "Confirmar activación"}
              </Button>
            </div>
          )}

          {twoFactorEnabled && (
            <>
              {backupCodes.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">
                    Tus códigos de respaldo (uso único):
                  </p>
                  <ul className="grid grid-cols-2 gap-1 rounded-md border p-3 font-mono text-xs">
                    {backupCodes.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Label htmlFor="pwd-manage">Contraseña</Label>
                <Input
                  id="pwd-manage"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={regenerate} disabled={pending}>
                  Regenerar códigos de respaldo
                </Button>
                <Button variant="destructive" onClick={disable} disabled={pending}>
                  Desactivar 2FA
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}