import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/database";
import {
  admin as adminPlugin,
  openAPI,
  organization,
  jwt,
} from "better-auth/plugins";
import { testUtils } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { smtp_transporter } from "../smtp";
import { createElement } from "react";
import { render } from "@react-email/render";
import VerificationEmail from "@/lib/email/templates/verification-email";
import ResetPasswordEmail from "@/lib/email/templates/reset-password-email";
import ExistingSignupEmail from "@/lib/email/templates/existing-signup-email";
import {
  accessControl,
  admin,
  user,
  moderator,
  orgRoles,
} from "../permissions";
import { oauthProvider, oauthDeviceAuthorization } from "@better-auth/oauth-provider";
// import { microsoft } from "@/plugins/providers/microsoft"; // Coming Soon
import { env } from "@/env";
import { email } from "../email";
import { WelcomeEmail } from "@/lib/email/templates/welcome-email";
import {
  EmailSdkError,
  EmailValidationError,
  EmailAdapterError,
} from "@opencoredev/email-sdk";
// ponytail: AC reuse from static RBAC so dynamic org roles share the same
// statements (auth, project, defaultStatements) defined in permissions.ts

/**
 * Better Auth server instance.
 *
 * Plugins (order matters):
 * 1. adminPlugin — user CRUD, ban, role assignment
 * 2. organization — multi-tenant with dynamic roles (DAC)
 * 3. openAPI — Swagger at /api/auth/reference
 * 4. jwt — JWT support (required by oauthProvider)
 * 5. oauthProvider — OAuth 2.1 server (authorize, token, userinfo)
 * 6. oauthDeviceAuthorization — RFC 8628 device flow (OAuth grant)
 * 7. nextCookies — cookie serialization for server components.
 *    MUST be LAST: plugins whose hooks.after run after it would set
 *    Set-Cookie headers that never reach the Next.js cookie store.
 *
 * @see https://www.better-auth.com/docs
 */
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL.replace(/\/+$/, ""),
  basePath: "/api/auth",
  debug: env.BETTER_AUTH_SERVER_DEBUG,
  appName: env.BETTER_AUTH_SERVER_NAME,
  secret: env.BETTER_AUTH_SERVER_SECRET,
  trustedOrigins: env.BETTER_AUTH_SERVER_TRUSTED_ORIGINS,
  advanced: {
    useSecureCookies: true,
    disableCSRFCheck: false,
    disableOriginCheck: false,
    crossSubDomainCookies: {
      enabled: true,
    },
  },
  socialProviders: {
    microsoft: {
      enabled: true,

      prompt: env.BETTER_AUTH_MICROSOFT_PROMPT,
      clientId: env.BETTER_AUTH_MICROSOFT_CLIENT_ID,
      tenantId: env.BETTER_AUTH_MICROSOFT_TENANT_ID,
      authority: env.BETTER_AUTH_MICROSOFT_AUTHORITY,
      clientSecret: env.BETTER_AUTH_MICROSOFT_CLIENT_SECRET,
      profilePhotoSize: env.BETTER_AUTH_MICROSOFT_PROFILE_PHOTO_SIZE,
      overrideUserInfoOnSignIn:
        env.BETTER_AUTH_MICROSOFT_OVERRIDE_USER_INFO_ON_SIGN_IN,
      // ponytail: Microsoft ID token doesn't always include email_verified (optional claim).
      // Since Microsoft authenticated the user, trust their verification.
      // mapProfileToUser: () => ({ emailVerified: true }),
    },
  },
  experimental: { joins: true },

  rateLimit: {
    // ponytail: global default solo aplica a endpoints sin regla propia.
    // Los paths /oauth2/* tienen límites por-endpoint (token/authorize/etc.)
    // definidos abajo en oauthProvider — esos tienen precedencia.
    window: 60,
    max: 50,
  },

  databaseHooks: {
    verification: {},

    session: {},

    account: {},

    user: {
      create: {
        after: async (user) => {
          // ponytail: skip verification for OAuth users (email already verified by provider)
          // if (user.emailVerified) return;
          // await auth.api.sendVerificationEmail({
          //   body: {
          //     email: user.email,
          //     callbackURL: "/dashboard",
          //   },
          // });

          try {
            console.log(`User created: ${user.email} (ID: ${user.id})`);
            email.send({
              from: env.BETTER_AUTH_SMTP_TRANSPORTER_FROM,
              to: user.email,
              subject: "Welcome to Auth Gate",
              html: await render(
                <WelcomeEmail url="https://example.com" user={user} />,
              ),
            });
          } catch (error) {
            if (error instanceof EmailValidationError) {
              // Bad message shape or unsupported field — fix the code path, do not retry.
              throw error;
            }

            if (error instanceof EmailAdapterError) {
              console.error(
                `${error.adapter} failed`,
                error.status,
                error.message,
              );
              if (error.retryable) {
                // await queue.retryLater(message); // transient — re-enqueue
                return;
              }
              throw error; // 401/422-style failure: needs a config or account fix
            }

            if (
              error instanceof EmailSdkError &&
              String(error.code) === "all_providers_failed"
            ) {
              // Every route failed; details is one error per adapter, in route order.
              console.error(error.message);
            }

            throw error;
          }
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,

    sendResetPassword: async ({ user, url }) => {
      try {
        const html = await render(
          createElement(ResetPasswordEmail, { user, url }),
        );
        await smtp_transporter.sendMail({
          from: '"ISC Auth" <Soporte@integritysolutions.com.ec>',
          to: user.email,
          subject: "Reset your password",
          html,
        });
      } catch (err) {
        console.error("Failed to send reset password email:", err);
      }
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
    onExistingUserSignUp: async ({ user }) => {
      try {
        const html = await render(createElement(ExistingSignupEmail, { user }));
        await smtp_transporter.sendMail({
          from: '"ISC Auth" <Soporte@integritysolutions.com.ec>',
          to: user.email,
          subject: "Sign-up attempt detected",
          html,
        });
      } catch (err) {
        console.error("Failed to send existing signup email:", err);
      }
    },
  },

  emailVerification: {
    expiresIn: 1200,
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: false,

    beforeEmailVerification: async (user, _request) => {
      console.log(`User ${user.email} is about to verify their email address.`);

      return;
    },

    afterEmailVerification: async (user, _request) => {
      console.log(`User ${user.email} has verified their email address.`);

      return;
    },

    sendVerificationEmail: async ({ user, url }) => {
      try {
        const html = await render(
          createElement(VerificationEmail, { user, url }),
        );
        const { messageId } = await smtp_transporter.sendMail({
          from: '"ISC Auth" <Soporte@integritysolutions.com.ec>',
          to: user.email,
          subject: "Verify your email address",
          html,
        });
        console.log("Verification email sent: %s", messageId);
      } catch (err) {
        console.error("Failed to send verification email:", err);
      }
    },
  },

  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),

  plugins: [
    openAPI({}),
    jwt(),
    adminPlugin({
      adminUserIds: [],
      ac: accessControl,
      roles: { admin, user, moderator },
    }),
    organization({
      ac: accessControl,
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      membershipLimit: 100,
      dynamicAccessControl: {
        enabled: true,
      },
      roles: {
        ...orgRoles,
      },
    }),

    oauthProvider({
      loginPage: "/auth/sign-in",
      consentPage: "/auth/consent",
      // ponytail: registro dinámico desactivado por defecto — solo admins crean
      // clients vía dashboard. Activar con feature flag cuando haya onboarding público.
      allowDynamicClientRegistration:
        env.BETTER_AUTH_OAUTH_DYNAMIC_CLIENT_REGISTRATION,
      allowUnauthenticatedClientRegistration: false,

      // ponytail: scopes mínimos OIDC. Custom scopes por resource → agregar cuando se definan
      scopes: ["openid", "profile", "email", "offline_access"],
      // ponytail: trusted clients de primera parte (inmutables vía CRUD del
      // plugin). Configurables por env; el dashboard los muestra con badge y
      // bloquea eliminar/rotar. Expandir con MCP agents si aplica.
      cachedTrustedClients: new Set(env.BETTER_AUTH_OAUTH_TRUSTED_CLIENTS),
      // Resources protegidos (RFC 8707). Seed inicial opcional de bootstrap
      // (insertOnly, no pisa edits de admin); fuente de verdad = tabla
      // oauth_resources gestionada por CRUD admin + dashboard (ver
      // env/server.schema.ts).
      resources: env.BETTER_AUTH_OAUTH_RESOURCES,
      // ponytail: CRUD admin de clients/resources solo para admins. Sin estos
      // gates el plugin permite gestionarlos a cualquier sesión autenticada.
      clientPrivileges: async ({ user }) => user?.role === "admin",
      resourcePrivileges: async ({ user }) => user?.role === "admin",
      // ponytail: límites por-endpoint para integraciones 3rd party.
      // Token endpoint más holgado (1 req/s promedio por IP).
      rateLimit: {
        token: { window: 60, max: 60 },
        authorize: { window: 60, max: 30 },
        introspect: { window: 60, max: 100 },
        revoke: { window: 60, max: 30 },
        register: { window: 60, max: 5 },
        userinfo: { window: 60, max: 60 },
      },
    }),
    // RFC 8628 device flow: /oauth2/device/authorize (código de dispositivo) +
    // página /auth/device para aprobar/negar el acceso con sesión.
    oauthDeviceAuthorization({
      verificationUri: "/auth/device",
    }),
    nextCookies(),
    ...(process.env.NODE_ENV === "test" ? [testUtils()] : []),
  ],
});
