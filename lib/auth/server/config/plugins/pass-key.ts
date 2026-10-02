import type { BetterAuthPlugin } from "better-auth";
import { passkey } from "@better-auth/passkey";
import { APIError } from "@better-auth/core/error";

export const BetterAuthPasskeyServerConfig = passkey({
  registration: {
    requireSession: false, // permite registro sin sesión (passkey-first onboarding)
    resolveUser: async ({ ctx, context }) => {
      // context = email pasado desde el client (query param en generate-register-options)
      const email = context as string;
      if (!email || !email.includes("@")) {
        throw APIError.from("BAD_REQUEST", {
          code: "EMAIL_REQUIRED",
          message: "Email requerido para passkey-first",
        });
      }

      // Buscar usuario existente
      const existing = (await ctx.context.adapter.findOne({
        model: "user",
        where: [{ field: "email", value: email }],
      })) as { id: string; name: string | null; email: string } | null;

      if (existing) {
        return {
          id: existing.id,
          name: existing.name || email,
          displayName: existing.email,
        };
      }

      // Crear usuario nuevo sin password (passkey-first = email verificado implícito)
      const user = (await ctx.context.adapter.create({
        model: "user",
        data: {
          email,
          name: email.split("@")[0],
          emailVerified: true, // passkey-first = email verificado implícito
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })) as { id: string; name: string; email: string };
      return { id: user.id, name: user.name, displayName: user.email };
    },
  },
}) satisfies BetterAuthPlugin;
