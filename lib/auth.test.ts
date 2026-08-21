import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { testDb } from "@/tests/database";
import { env } from "@/env";
import {
  admin as adminPlugin,
  jwt,
  organization,
  openAPI,
  testUtils,
  twoFactor,
  username,
  phoneNumber,
  emailOTP,
  magicLink,
  multiSession,
} from "better-auth/plugins";
import {
  oauthProvider,
  oauthDeviceAuthorization,
} from "@better-auth/oauth-provider";
import { apiKey } from "@better-auth/api-key";
import { nextCookies } from "better-auth/next-js";
import { accessControl, admin, user, moderator, orgRoles } from "./permissions";

export const lastEmailOtp: { email?: string; code?: string } = {};
export const lastMagicLink: { email?: string; url?: string; token?: string } = {};

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
    }),
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
    }),
    phoneNumber({
      sendOTPOnSignUp: false,
      requireVerificationOnSignIn: false,
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
    nextCookies(),
  ],
});
