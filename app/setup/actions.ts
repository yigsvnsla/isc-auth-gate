"use server";

import z from "zod";
import { hashPassword } from "better-auth/crypto";
import { createLocalAccountIssuer } from "@better-auth/core/db";

import { db } from "@/database";
import {
  accounts,
  members,
  organizations,
  users,
} from "@/database/schema";
import { needsSetup } from "@/lib/setup";

// ponytail: setup es la única ruta que crea el primer admin sin SMTP ni
// sesión — insertamos directo en DB (user/account/org/member). Esto evita:
// - el databaseHook de bienvenida (envía email al crear user, fallaría sin SMTP)
// - el flujo email-verification (requireEmailVerification bloquearía el login)
// El hash usa el mismo algoritmo de Better Auth (scrypt), el login normal
// por /sign-in funciona sin cambios.
const setupSchema = z.object({
  name: z.string().min(1, "Requerido"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  organizationName: z.string().min(1, "Requerido"),
});

function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "org"
  );
}

export type SetupResult = { error?: string };

export async function completeSetup(
  _prev: SetupResult,
  formData: FormData,
): Promise<SetupResult> {
  // Gate: si ya hay admin, no recrear (idempotencia + seguridad).
  if (!(await needsSetup())) {
    return { error: "El setup ya fue completado." };
  }

  const parsed = setupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    organizationName: formData.get("organizationName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { name, email, password, organizationName } = parsed.data;

  const userId = crypto.randomUUID();
  const orgId = crypto.randomUUID();
  const accountId = crypto.randomUUID();

  // ponytail: check-then-insert sin transacción/exclusión — la ventana de
  // carrera es real pero irrelevante (setup ocurre una vez, en frío, un solo
  // operador). Si algún día hay multi-instancia en primer boot, mover a
  // una transacción con lock advisory.
  if (!(await needsSetup())) {
    return { error: "El setup ya fue completado." };
  }

  try {
    await db.insert(users).values({
      id: userId,
      name,
      email,
      emailVerified: true,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(accounts).values({
      id: accountId,
      issuer: createLocalAccountIssuer("credential"),
      accountId: userId,
      providerId: "credential",
      userId,
      password: await hashPassword(password),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(organizations).values({
      id: orgId,
      name: organizationName,
      slug: slugify(organizationName),
      createdAt: new Date(),
    });

    await db.insert(members).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId,
      role: "owner",
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Setup falló:", error);
    return { error: "Error al crear la cuenta inicial. Revisa los logs." };
  }

  return {};
}
