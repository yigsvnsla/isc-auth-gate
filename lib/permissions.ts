import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  auth: ["create", "read", "update", "delete", "access"],
  project: ["create", "read", "update", "delete"],
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
