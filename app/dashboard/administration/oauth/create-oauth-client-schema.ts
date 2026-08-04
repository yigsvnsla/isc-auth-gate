import { z } from "zod";

// * Step 1: Datos Principales y Redirección
export const step1Schema = z.object({
  client_name: z
    .string()
    .min(1, "El nombre del cliente es obligatorio")
    .optional(),
  type: z.enum(["web", "native", "user-agent-based"]).optional(),
  redirect_uris: z
    .array(z.url("Debe ser una URL válida"))
    .min(1, "Debes incluir al menos una URI de redirección"),
  post_logout_redirect_uris: z
    .array(z.url("Debe ser una URL válida"))
    .optional(),
});

export type Step1Data = z.infer<typeof step1Schema>;

// * Step 2: Configuración OAuth2 y Seguridad

export const step2Schema = z.object({
  token_endpoint_auth_method: z
    .enum(["none", "client_secret_basic", "client_secret_post"])
    .default("client_secret_basic"),
  grant_types: z
    .array(
      z.enum(["authorization_code", "client_credentials", "refresh_token"]),
    )
    .default(["authorization_code"]),
  response_types: z.array(z.enum(["code"])).default(["code"]),
  scope: z.string().optional(),
  require_pkce: z.boolean().optional(),
});

export type Step2Data = z.infer<typeof step2Schema>;

// * Step 3: Marca, Legal y Opciones Avanzadas (Admin)

export const step3Schema = z.object({
  // Branding & URLs
  client_uri: z.url("Debe ser una URL válida").optional(),
  logo_uri: z.url("Debe ser una URL válida").optional(),
  contacts: z.array(z.email("Debe ser un email válido")).optional(),

  // Legal
  tos_uri: z.url("Debe ser una URL válida").optional(),
  policy_uri: z.url("Debe ser una URL válida").optional(),

  // Software Info & Metadata
  software_id: z.string().optional(),
  software_version: z.string().optional(),
  software_statement: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),

  // Opciones de Administrador (adminCreateOAuthClient)
  skip_consent: z.boolean().optional(),
  enable_end_session: z.boolean().optional(),
  subject_type: z.enum(["public", "pairwise"]).optional(),
  client_secret_expires_at: z.union([z.string(), z.number()]).optional(),
});

export type Step3Data = z.infer<typeof step3Schema>;

// * UNIFICADO

// export const createOAuthClientDataSchema = z.object({
//   ...step1Schema,
//   ...step2Schema,
//   ...step3Schema,
// });
export const createOAuthClientDataSchema = step1Schema
  .extend(step2Schema.shape)
  .extend(step3Schema.shape);

export type CreateOAuthClientData = z.infer<typeof createOAuthClientDataSchema>;
