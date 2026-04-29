import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/database";
import { admin as adminPlugin, openAPI, organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
// import { smtp_transporter } from "./smtp"; // Coming Soon
import { accessControl, admin, user, moderator } from "./permissions";
// import { microsoft } from "@/plugins/providers/microsoft"; // Coming Soon
import { env } from "@/env";

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

      // Optional: You can specify additional options here
    },
  },
  experimental: { joins: true },

  databaseHooks: {
    user: {
      create: {
        async after(user) {
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
    sendResetPassword: async ({ user, url, token }, request) => {
      console.log({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
    onPasswordReset: async ({ user }, request) => {
      // your logic here
      console.log(`Password for user ${user.email} has been reset.`);
    },
    onExistingUserSignUp: async ({ user }, request) => {
      console.log({
        to: user.email,
        subject: "Sign-up attempt with your email",
        text: "Someone tried to create an account using your email address. If this <was you, try signing in instead. If not, you can safely ignore this email.",
      });
    },
  },

  emailVerification: {
    expiresIn: 1200,
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: false,

    sendVerificationEmail: async ({ user, url, token }) => {
      console.log({ user, url, token });

      // const { messageId } = await smtp_transporter.sendMail({
      //   from: "soporte@integritysolutions.com.ec",
      //   to: user.email,
      //   subject: "Account Verification 📨",
      //   html: `TEST: ${url}`,
      // });

      // console.log("Message sent: %s", messageId);
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
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      membershipLimit: 100,
    }),
    openAPI(),
    nextCookies(),
  ],
});
