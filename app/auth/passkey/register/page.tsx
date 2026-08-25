"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Fingerprint, Loader2, Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function PasskeyRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "registering" | "success" | "error">("email");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Ingresa un email válido");
      return;
    }
    setPending(true);
    setError("");
    setStep("registering");
    try {
      const res = await authClient.passkey.addPasskey({
        context: email,
        createSession: true,
        authenticatorAttachment: "platform",
      });

      if (res.error) {
        throw new Error(res.error.message || "Error registrando passkey");
      }

      setStep("success");
      toast.success("Cuenta creada con Passkey. Redirigiendo...");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error en registro passkey";
      setError(msg);
      setStep("error");
      toast.error(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Fingerprint className="size-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Registrarse con Passkey</CardTitle>
          <CardDescription>
            Sin contraseña. Solo tu huella, FaceID o llave de seguridad.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {step === "email" && (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Ingresa tu email para crear una cuenta usando WebAuthn (TouchID, FaceID, Windows Hello, YubiKey, etc.)
              </p>
              <div className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="size-4" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    disabled={pending}
                  />
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleRegister}
                  disabled={pending || !email.includes("@")}
                >
                  {pending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Registrarse con Passkey"
                  )}
                </Button>
              </div>
            </>
          )}

          {step === "registering" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <Fingerprint className="size-12 text-primary animate-pulse" />
              <p className="text-muted-foreground">
                Generando opciones de registro WebAuthn...
              </p>
              <p className="text-sm text-muted-foreground">
                El navegador abrirá el diálogo de autenticación biométrica
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="size-12 text-green-600" />
              <h3 className="text-lg font-semibold">¡Cuenta creada!</h3>
              <p className="text-sm text-muted-foreground">
                Tu passkey está registrada. Iniciando sesión...
              </p>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="size-12 text-destructive" />
              <h3 className="text-lg font-semibold">Error</h3>
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={() => setStep("email")}>
                Volver a intentar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}