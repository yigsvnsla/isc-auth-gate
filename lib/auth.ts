import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/database";
import { admin as adminPlugin, openAPI, organization, jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { smtp_transporter } from "./smtp";
import { createElement } from "react";
import { render } from "@react-email/render";
import VerificationEmail from "@/emails/verification-email";
import ResetPasswordEmail from "@/emails/reset-password-email";
import ExistingSignupEmail from "@/emails/existing-signup-email";
import { accessControl, admin, user, moderator, orgSystemAdmin } from "./permissions";
import { oauthProvider } from "@better-auth/oauth-provider";
// import { microsoft } from "@/plugins/providers/microsoft"; // Coming Soon
import { env } from "@/env";
// ponytail: AC reuse from static RBAC so dynamic org roles share the same
// statements (auth, project, defaultStatements) defined in permissions.ts

/**
 * Better Auth server instance.
 *
 * Plugins (order matters):
 * 1. adminPlugin — user CRUD, ban, role assignment
 * 2. organization — multi-tenant with dynamic roles (DAC)
 * 3. openAPI — Swagger at /api/auth/reference
 * 4. nextCookies — cookie serialization for server components
 * 5. jwt — JWT support (required by oauthProvider)
 * 6. oauthProvider — OAuth 2.1 server (authorize, token, userinfo)
 *
 * @see https://www.better-auth.com/docs
 */
export const auth = betterAuth({
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
      prompt: env.BETTER_AUTH_MICROSOFT_PROMPT,
      clientId: env.BETTER_AUTH_MICROSOFT_CLIENT_ID,
      tenantId: env.BETTER_AUTH_MICROSOFT_TENANT_ID,
      authority: env.BETTER_AUTH_MICROSOFT_AUTHORITY,
      clientSecret: env.BETTER_AUTH_MICROSOFT_CLIENT_SECRET,
      profilePhotoSize: env.BETTER_AUTH_MICROSOFT_PROFILE_PHOTO_SIZE,
      overrideUserInfoOnSignIn:env.BETTER_AUTH_MICROSOFT_OVERRIDE_USER_INFO_ON_SIGN_IN,
      // ponytail: Microsoft ID token doesn't always include email_verified (optional claim).
      // Since Microsoft authenticated the user, trust their verification.
      mapProfileToUser: () => ({ emailVerified: true }),
    },
  },
  experimental: { joins: true },

  rateLimit: {
    window: 60,
    max: 10,
  },

  databaseHooks: {
    user: {
      create: {
        async after(user) {
          // ponytail: skip verification for OAuth users (email already verified by provider)
          if (user.emailVerified) return;
          await auth.api.sendVerificationEmail({
            body: {
              email: user.email,
              callbackURL: "/dashboard",
            },
          });
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
        const html = await render(createElement(ResetPasswordEmail, { user, url }));
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

    sendVerificationEmail: async ({ user, url }) => {
      try {
        const html = await render(createElement(VerificationEmail, { user, url }));
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
    adminPlugin({
      adminUserIds: ["5RfQlRTKmUCC2H5EyAnHAgSLwxelZsz9"],
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
        systemAdmin: orgSystemAdmin,
      },
    }),
    openAPI(),
    nextCookies(),
    jwt(),
    oauthProvider({
      loginPage: "/auth/sign-in",
      consentPage: "/auth/consent",
      allowDynamicClientRegistration: true,
      // ponytail: scopes mínimos OIDC. Custom scopes por resource → agregar cuando se definan
      scopes: ["openid", "profile", "email", "offline_access"],
      // ponytail: trusted client para el dashboard propio. Expandir con MCP agents si aplica
      cachedTrustedClients: new Set(["isc-gate-dashboard"]),
    }),
  ],
});
