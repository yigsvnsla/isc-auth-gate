import { z } from "zod";

// ==========================================
// 1. Información General y Metadatos del Cliente
// ==========================================
export const clientMetadataSchema = z.object({
  client_name: z.string().optional(),
  client_uri: z.url().optional(),
  logo_uri: z.url().optional(),
  contacts: z.array(z.email()).optional(),
  tos_uri: z.url().optional(),
  policy_uri: z.url().optional(),
  software_id: z.string().optional(),
  software_version: z.string().optional(),
  software_statement: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ==========================================
// 2. Configuración de URIs y Redirecciones
// ==========================================
export const clientUrisSchema = z.object({
  redirect_uris: z.array(z.url()),
  post_logout_redirect_uris: z.array(z.url()).optional(),
});

// ==========================================
// 3. Protocolo OAuth2, Autenticación y Seguridad
// ==========================================
export const clientOAuthConfigSchema = z.object({
  scope: z.string().optional(),
  token_endpoint_auth_method: z
    .enum(["none", "client_secret_basic", "client_secret_post"])
    .default("client_secret_basic")
    .optional(),
  grant_types: z
    .array(
      z.enum(["authorization_code", "client_credentials", "refresh_token"])
    )
    .default(["authorization_code"])
    .optional(),
  response_types: z
    .array(z.enum(["code"]))
    .default(["code"])
    .optional(),
  type: z.enum(["web", "native", "user-agent-based"]).optional(),
  client_secret_expires_at: z
    .union([z.string(), z.number()])
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