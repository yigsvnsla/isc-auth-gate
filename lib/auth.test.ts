import { betterAuth } from "better-auth";
import { APIError } from "@better-auth/core/error";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { testDb } from "@/tests/database";
import { env } from "@/env";
import {
  admin as adminPlugin,
  openAPI,
  organization,
  jwt,
  twoFactor,
  username,
  phoneNumber,
  emailOTP,
  magicLink,
  multiSession,
  lastLoginMethod,
  bearer,
  haveIBeenPwned,
  captcha,
  oneTimeToken,
  oauthPopup,
  testUtils,
} from "better-auth/plugins";
import { genericOAuth, microsoftEntraId } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import {
  oauthProvider,
  oauthDeviceAuthorization,
} from "@better-auth/oauth-provider";
import { apiKey } from "@better-auth/api-key";
import { nextCookies } from "better-auth/next-js";
import { accessControl, admin, user, moderator, orgRoles } from "./permissions";

export const lastEmailOtp: { email?: string; code?: string } = {};
export const lastMagicLink: { email?: string; url?: string; token?: string } =
  {};
export const lastInviteEmail: {
  email?: string;
  id?: string;
  org?: string;
} = {};

export const testAuth = betterAuth({
  debug: env.BETTER_AUTH_SERVER_DEBUG,
  appName: env.BETTER_AUTH_SERVER_NAME,
  secret: env.BETTER_AUTH_SERVER_SECRET,
  trustedOrigins: env.BETTER_AUTH_SERVER_TRUSTED_ORIGINS,
  advanced: {
    useSecureCookies: true,
    disableCSRFCheck: true,
    disableOriginCheck: true,
    crossSubDomainCookies: {
      enabled: true,
    },
  },
  database: drizzleAdapter(testDb, {
    provider: "pg",
    usePlural: true,
  }),
  // Additional fields: campos custom en user/session (DB only, no en JWT).
  user: {
    additionalFields: {
      securityLevel: { type: "string", default: "standard", required: false },
      mfaEnforcedAt: { type: "date", required: false },
    },
  },
  session: {
    additionalFields: {
      securityLevel: { type: "string", required: false },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    testUtils({
      captureOTP: true,
    }),
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
      dynamicAccessControl: { enabled: true },
      roles: {
        ...orgRoles,
      },
      sendInvitationEmail: async (data: {
        email: string;
        organization: { name: string };
        inviter: { user: { name?: string; email: string } };
        role: string;
        id: string;
      }) => {
        lastInviteEmail.email = data.email;
        lastInviteEmail.id = data.id;
        lastInviteEmail.org = data.organization?.name;
      },
    }),
    openAPI(),
    jwt(),
    oauthProvider({
      loginPage: "/auth/sign-in",
      consentPage: "/auth/consent",
      allowDynamicClientRegistration: true,
      allowUnauthenticatedClientRegistration: true,
      resources: [
        {
          identifier: "https://api.test.example.com",
          name: "API de prueba",
          allowedScopes: ["openid", "profile", "email", "offline_access"],
        },
      ],
      resourcePrivileges: async ({ user }) => user?.role === "admin",
      clientPrivileges: async ({ user }) => user?.role === "admin",
    }),
    oauthDeviceAuthorization({
      verificationUri: "/auth/device",
    }),
    twoFactor({
      issuer: env.BETTER_AUTH_SERVER_NAME,
      otpOptions: {
        sendOTP: async () => {},
      },
    }),
    apiKey({
      enableSessionForAPIKeys: true,
      enableMetadata: true,
    }),
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
    }),
    phoneNumber({
      requireVerification: false,
      otpLength: 6,
      sendOTP: async () => {},
    }),
    emailOTP({
      sendVerificationOTP: async ({ email, otp }) => {
        lastEmailOtp.email = email;
        lastEmailOtp.code = otp;
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url, token }) => {
        lastMagicLink.email = email;
        lastMagicLink.url = url;
        lastMagicLink.token = token;
      },
    }),
    multiSession({ maximumSessions: 5 }),
    lastLoginMethod({ storeInDatabase: true }),
    // Microsoft Entra ID: OAuth2/OIDC nativo para Azure AD (via genericOAuth).
    // ponytail: providerId "microsoft" fuerza callback /api/auth/callback/microsoft (ya registrado en Azure)
    genericOAuth({
      config: [
        {
          ...microsoftEntraId({
            clientId: env.BETTER_AUTH_MICROSOFT_CLIENT_ID,
            clientSecret: env.BETTER_AUTH_MICROSOFT_CLIENT_SECRET,
            tenantId: env.BETTER_AUTH_MICROSOFT_TENANT_ID ?? "common",
          }),
          providerId: "microsoft",
          accountIssuer: `https://login.microsoftonline.com/${env.BETTER_AUTH_MICROSOFT_TENANT_ID ?? "common"}/v2.0`,
          requireIdTokenVerification: false,
        },
      ],
    }),
    bearer(),
    // OAuth Popup: UX popup para "Conectar con Microsoft/Google" sin redirect full-page.
    oauthPopup(),
    // Passkey (WebAuthn/FIDO2): autenticación sin contraseña.
    passkey({
      registration: {
        requireSession: false,
        resolveUser: async ({ ctx, context }) => {
          const email = context as string;
          if (!email || !email.includes("@")) {
            throw APIError.from("BAD_REQUEST", { code: "EMAIL_REQUIRED", message: "Email requerido para passkey-first" });
          }
          const existing = (await ctx.context.adapter.findOne({
            model: "user",
            where: [{ field: "email", value: email }],
          })) as { id: string; name: string | null; email: string } | null;
          if (existing) return { id: existing.id, name: existing.name || email, displayName: existing.email };
          const user = (await ctx.context.adapter.create({
            model: "user",
            data: { email, name: email.split("@")[0], emailVerified: true, createdAt: new Date(), updatedAt: new Date() },
          })) as { id: string; name: string; email: string };
          return { id: user.id, name: user.name, displayName: user.email };
        },
      },
    }),
    // Inerto en tests: el chequeo real contra HIBP requiere red y no debe
    // bloquear el sign-up de los demás tests cuando la red es inestable.
    haveIBeenPwned({ enabled: false }),
    oneTimeToken({
      expiresIn: 10,
      storeToken: "hashed",
      disableClientRequest: true,
    }),
    nextCookies(),
  ],
});
