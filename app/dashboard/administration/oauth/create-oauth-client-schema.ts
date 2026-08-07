import { z } from "zod";

// ==========================================
// 1. Información General y Metadatos del Cliente
// ==========================================
export const clientMetadataSchema = z.object({
  client_name: z
    .string()
    .trim()
    .min(1, "El nombre del cliente es requerido")
    .max(100),
  client_uri: z.url().max(500).optional(),
  logo_uri: z.url().max(500).optional(),
  contacts: z.array(z.email().max(254)).max(10).optional(),
  tos_uri: z.url().max(500).optional(),
  policy_uri: z.url().max(500).optional(),
  software_id: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/,
      "Formato inválido, ej: com.isc.testapp",
    )
    .max(255)
    .optional(),
  software_version: z
    .string()
    .regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
      { message: "Versión SemVer inválida (ejemplo válido: 1.0.0)" },
    )
    .optional(),
  software_statement: z.string().max(4096).optional(),
  metadata: z
    .record(z.string(), z.unknown())
    .refine(
      (record) => Object.keys(record).length <= 50,
      "Máximo 50 claves en metadatos",
    )
    .optional(),
});

// ==========================================
// 2. Configuración de URIs y Redirecciones
// ==========================================
export const clientUrisSchema = z.object({
  redirect_uris: z
    .array(z.url().max(500))
    // .min(1, "Al menos una Redirect URI es requerida")
    .optional(),
  post_logout_redirect_uris: z.array(z.url().max(500)).optional(),
});

// ==========================================
// 3. Protocolo OAuth2, Autenticación y Seguridad
// ==========================================
export const clientOAuthConfigSchema = z.object({
  scope: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z0-9._-]+(?: [a-zA-Z0-9._-]+)*$/,
      "Scopes separados por espacios",
    )
    .max(1024)
    .optional(),
  token_endpoint_auth_method: z
    .enum(["none", "client_secret_basic", "client_secret_post"])
    .default("client_secret_basic")
    .optional(),
  grant_types: z
    .array(
      z.enum(["authorization_code", "client_credentials", "refresh_token"]),
    )
    .min(1)
    .default(["authorization_code"])
    .optional(),
  response_types: z
    .array(z.enum(["code"]))
    .min(1)
    .default(["code"])
    .optional(),
  type: z.enum(["web", "native", "user-agent-based"]).optional(),
  client_secret_expires_at: z
    .union([z.number().int().nonnegative(), z.string()])
    .optional()
    .default(0),
  skip_consent: z.boolean().optional(),
  enable_end_session: z.boolean().optional(),
  require_pkce: z.boolean().optional(),
  subject_type: z.enum(["public", "pairwise"]).optional(),
});

// ==========================================
// Esquema Principal Unificado (Create OAuth Client Body)
// ==========================================
export const createOAuthClientDataSchema = clientMetadataSchema
  .extend(clientUrisSchema.shape)
  .extend(clientOAuthConfigSchema.shape);

export type CreateOAuthClientData = z.input<typeof createOAuthClientDataSchema>;
