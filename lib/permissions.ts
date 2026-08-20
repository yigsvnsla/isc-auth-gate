import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

/**
 * RBAC statements.
 *
 * Extends Better Auth defaultStatements with project, org-native, and oauth.
 * Used across adminPlugin (static roles) and organization plugin (dynamic roles).
 *
 * org-native statements (organization, member, invitation, team, ac) are
 * required by organization plugin's dynamicAccessControl for per-org role creation.
 *
 * To add a new permission: add statement here → assign to role below → done.
 * @see https://www.better-auth.com/docs/plugins/access
 */
const statement = {
  ...defaultStatements,
  auth: ["create", "read", "update", "delete", "access"],
  project: ["create", "read", "update", "delete"],
  // ponytail: org-native statements required by DAC for per-org role creation
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
  oauth: ["create", "read", "update", "delete"],
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

// Roles org por defecto (mirror de better-auth/plugins organization access
// statement.mjs). Necesarios explícitos: hasPermission del plugin usa
// `options.roles || defaultRoles` sin merge — si pasamos `roles` parcial,
// owner/admin/member desaparecen del acceso.
export const orgOwner = accessControl.newRole({
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
});

export const orgAdmin = accessControl.newRole({
  organization: ["update"],
  invitation: ["create", "cancel"],
  member: ["create", "update", "delete"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
});

export const orgMember = accessControl.newRole({
  organization: [],
  member: [],
  invitation: [],
  team: [],
  ac: ["read"],
});

export const orgRoles = {
  owner: orgOwner,
  admin: orgAdmin,
  member: orgMember,
  systemAdmin: orgSystemAdmin,
} as const;
