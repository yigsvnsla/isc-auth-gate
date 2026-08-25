"use client";

import { useState, useEffect } from "react";
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
import { ShieldCheckIcon, ShieldOffIcon, Link2, Monitor, Fingerprint, Trash2, Plus, Loader2, Mail, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import QRCode from "react-qr-code";

type Passkey = {
  id: string;
  name?: string;
  credentialID: string;
  deviceType: string;
  transports?: string;
  createdAt: Date | string;
  aaguid?: string;
};

export default function SecuritySettingsPage() {
  const { data: session } = authClient.useSession();
  const twoFactorEnabled = session?.user?.twoFactorEnabled ?? false;

  const [password, setPassword] = useState("");
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState("");
  const [pending, setPending] = useState(false);
  const [connectingMicrosoft, setConnectingMicrosoft] = useState(false);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loadingPasskeys, setLoadingPasskeys] = useState(false);
  const [addingPasskey, setAddingPasskey] = useState(false);
  const [deletingPasskeyId, setDeletingPasskeyId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyCode, setShowVerifyCode] = useState(false);

  const loadPasskeys = async () => {
    setLoadingPasskeys(true);
    try {
      const res = await authClient.passkey.listUserPasskeys();
      if (res.error) {
        toast.error(res.error.message || "Error cargando passkeys");
      } else if (res.data) {
        setPasskeys(res.data);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error cargando passkeys");
    } finally {
      setLoadingPasskeys(false);
    }
  };

  const addPasskey = async () => {
    setAddingPasskey(true);
    try {
      const res = await authClient.passkey.addPasskey({
        createSession: false,
      });
      if (res.error) {
        toast.error(res.error.message || "Error añadiendo passkey");
      } else {
        toast.success("Passkey añadida correctamente");
        await loadPasskeys();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error añadiendo passkey");
    } finally {
      setAddingPasskey(false);
    }
  };

  const deletePasskey = async (id: string) => {
    setDeletingPasskeyId(id);
    try {
      const res = await authClient.passkey.deletePasskey({ id });
      if (res.error) {
        toast.error(res.error.message || "Error eliminando passkey");
      } else {
        toast.success("Passkey eliminada");
        setPasskeys((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error eliminando passkey");
    } finally {
      setDeletingPasskeyId(null);
    }
  };

  // Load passkeys on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    loadPasskeys();
  }, []);

  const connectMicrosoft = async () => {
    setConnectingMicrosoft(true);
    try {
      await authClient.signIn.popup({
        provider: "microsoft",
        callbackURL: "/dashboard/settings/security",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al conectar Microsoft");
    } finally {
      setConnectingMicrosoft(false);
    }
  };

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
                <div className="relative">
                  <Input
                    id="totp-verify"
                    type={showVerifyCode ? "text" : "password"}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="123456"
                    inputMode="text"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowVerifyCode(!showVerifyCode)}
                  >
                    {showVerifyCode ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
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
                <div className="relative">
                  <Input
                    id="pwd-manage"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="size-5" /> Cuentas vinculadas
          </CardTitle>
          <CardDescription>
            Conecta proveedores OAuth para iniciar sesión sin contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-md border bg-muted/40 p-4">
            <div className="flex items-center gap-3">
              <Monitor className="size-6 text-blue-600" />
              <div>
                <p className="font-medium">Microsoft Entra ID</p>
                <p className="text-sm text-muted-foreground">
                  Inicio de sesión corporativo (Azure AD / Office 365)
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={connectMicrosoft}
              disabled={connectingMicrosoft}
            >
              {connectingMicrosoft ? "Conectando..." : "Conectar cuenta Microsoft"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Usa OAuth Popup: se abre una ventana emergente sin salir de la página.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="size-5" /> Passkeys
          </CardTitle>
          <CardDescription>
            Gestiona tus llaves de acceso (WebAuthn/FIDO2) para acceso sin contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Passkeys registradas</p>
              <p className="text-sm text-muted-foreground">
                {passkeys.length} passkey{passkeys.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={addPasskey}
              disabled={addingPasskey}
            >
              <Plus className="mr-2 size-4" />
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              <p className="text-xs mt-1">Usa "Añadir passkey" para registrar una nueva llave de acceso.</p>
            </Button>
          </div>

          {loadingPasskeys ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Cargando passkeys...</span>
            </div>
          ) : passkeys.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              <p>No hay passkeys registradas.</p>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              <p className="text-xs mt-1">Usa "Añadir passkey" para registrar una nueva llave de acceso.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {passkeys.map((pk) => (
                <div
                  key={pk.id}
                  className="flex items-center justify-between rounded-md border bg-muted/40 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Fingerprint className="size-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {pk.name || `Passkey ${pk.id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {pk.credentialID.slice(0, 16)}... · {pk.deviceType} · {new Date(pk.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deletePasskey(pk.id)}
                    disabled={deletingPasskeyId === pk.id}
                    aria-label="Eliminar passkey"
                  >
                    {deletingPasskeyId === pk.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4 text-destructive" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}