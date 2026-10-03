import type { BetterAuthPlugin } from "better-auth";
import { organization } from "better-auth/plugins";
import { accessControl as ac, orgRoles as roles } from "@/lib/permissions";
import { env } from "@/env/server";
import { client as email } from "@/lib/email";

export const BetterAuthOrganizationServerConfig =
  organization({
    ac,
    roles,
    allowUserToCreateOrganization: true,
    organizationLimit: 5,
    membershipLimit: 100,
    dynamicAccessControl: {
      enabled: true,
    },
    sendInvitationEmail: async ({
      email: inviteeEmail,
      organization,
      inviter,
      role,
      id,
    }) => {
      const acceptUrl = `${env.BETTER_AUTH_URL.replace(/\/+$/, "")}/dashboard/organizations/invitations?id=${id}`;
      await email.send({
        from: env.BETTER_AUTH_SMTP_TRANSPORTER_FROM,
        to: inviteeEmail,
        subject: `Invitación a ${organization.name}`,
        text: `${inviter.user.name ?? inviter.user.email} te ha invitado a unirte a ${organization.name} como ${role}. Acepta aquí: ${acceptUrl}`,
      });
    },
  }) satisfies BetterAuthPlugin;
