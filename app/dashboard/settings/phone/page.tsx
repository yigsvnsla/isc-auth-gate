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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function PhoneSettingsPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    if (!phone) return toast.error("Ingresa un número de teléfono");
    setLoading(true);
    const { error } = await authClient.phoneNumber.sendOtp({ phoneNumber: phone });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Código enviado a tu teléfono (vía email)");
  }

  async function verify() {
    if (!phone || !code) return toast.error("Falta el código");
    setLoading(true);
    const { error } = await authClient.phoneNumber.verify({ phoneNumber: phone, code });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Teléfono verificado");
  }

  async function updatePhone() {
    if (!phone) return toast.error("Ingresa un número");
    setLoading(true);
    const { error } = await authClient.phoneNumber.updatePhoneNumber({ phoneNumber: phone });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Teléfono actualizado");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Teléfono</h2>
        <p className="text-sm text-muted-foreground">
          Vincula y verifica tu número de teléfono.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Número de teléfono</CardTitle>
          <CardDescription>
            Actual: {user?.phoneNumber ?? "Sin número"}.
            {user?.phoneNumberVerified ? " (verificado)" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Número (E.164, ej. +573001234567)</Label>
            <Input
              id="phone"
              placeholder="+573001234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={updatePhone} disabled={loading}>
              Guardar número
            </Button>
            <Button variant="outline" onClick={sendOtp} disabled={loading}>
              Enviar código
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Código de verificación</Label>
            <Input
              id="code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <Button onClick={verify} disabled={loading}>
            Verificar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
