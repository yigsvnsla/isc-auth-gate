"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export async function generateOneTimeTokenAction(): Promise<
  { token: string } | { error: string }
> {
  try {
    const res = await auth.api.generateOneTimeToken({
      headers: await headers(),
    });
    if (!res || !("token" in res)) {
      return { error: "No se generó el token" };
    }
    return { token: res.token };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al generar token";
    return { error: message };
  }
}
