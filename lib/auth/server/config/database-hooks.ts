import { email } from "@/lib/email";
import type { BetterAuthOptions } from "better-auth";
import { env } from "@/env/server";
import { render } from "@react-email/render";
import {
  EmailAdapterError,
  EmailSdkError,
  EmailValidationError,
} from "@opencoredev/email-sdk";
import { WelcomeEmail } from "@/lib/email/templates/welcome-email";

export const BetterAuthDatabaseHooksServerConfig = {
    verification: {},
    account: {},
    user: {
      create: {
        after: async (user) => {
          try {
            console.log(`User created: ${user.email} (ID: ${user.id})`);

            const template = WelcomeEmail({ user, url: "https://example.com" });
            email.send({
              to: user.email,
              from: env.BETTER_AUTH_SMTP_TRANSPORTER_FROM,
              subject: "Welcome to Auth Gate",
              html: await render(template, { pretty: true }),
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
  } satisfies BetterAuthOptions["databaseHooks"];
