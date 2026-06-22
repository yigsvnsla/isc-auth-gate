import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  auth: ["create", "read", "update", "delete", "access"],
  project: ["create", "read", "update", "delete"],
  // ponytail: statements org-native necesarios para que DAC del plugin organization
  // pueda crear roles con permisos de org (organization/member/invitation/team/ac)
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
} as const;

export const accessControl = createAccessControl(statement);

export const user = accessControl.newRole({
  project: ["create"],
});

export const moderator = accessControl.newRole({
  project: ["create", "update", "read"],
  user: ["ban"],
});

export const admin = accessControl.newRole({
  project: ["create", "update"],
  auth: ["create", "read", "update", "delete", "access"],
  ...adminAc.statements,
});

export const orgSystemAdmin = accessControl.newRole({
  ...adminAc.statements,
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
  auth: ["create", "read", "update", "delete", "access"],
  project: ["create", "read", "update", "delete"],
});
