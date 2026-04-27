import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { testDb } from "@/tests/database";
import { env } from "@/env";
import { admin as adminPlugin, organization, openAPI, testUtils } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { accessControl, admin, user, moderator } from "./permissions";

export const testAuth = betterAuth({
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
  database: drizzleAdapter(testDb, {
    provider: "pg",
    usePlural: true,
  }),
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
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      membershipLimit: 100,
    }),
    openAPI(),
    nextCookies(),
  ],
});