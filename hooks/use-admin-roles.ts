"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import {
  listOrgRolesAction,
  createOrgRoleAction,
  updateOrgRoleAction,
  deleteOrgRoleAction,
  listAllOrganizationsAction,
} from "@/lib/actions/admin-roles";

export interface OrganizationRole {
  id: string;
  organizationId: string;
  role: string;
  permission: Record<string, string[]>;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRoleArgs {
  organizationId?: string;
  role: string;
  permission: Record<string, string[]>;
}

export interface UpdateRoleArgs {
  organizationId?: string;
  roleName?: string;
  roleId?: string;
  data: {
    permission?: Record<string, string[]>;
    roleName?: string;
  };
}

export interface DeleteRoleArgs {
  organizationId?: string;
  roleName?: string;
  roleId?: string;
}

export const useOrganizations = () => {
  return useSWR("/admin/organizations", async () => {
    const data = await listAllOrganizationsAction();
    return data;
  });
};

export const useListRoles = (organizationId?: string) => {
  return useSWR(
    ["/admin/list-roles", organizationId],
    async ([, orgId]) => {
      if (!orgId) return [];
      const data = await listOrgRolesAction(orgId);
      return (data ?? []) as unknown as OrganizationRole[];
    },
  );
};

export const useCreateRole = () => {
  return useSWRMutation(
    "/admin/create-role",
    async (_key: string, { arg }: { arg: CreateRoleArgs }) => {
      return createOrgRoleAction(
        arg.organizationId ?? "",
        arg.role,
        arg.permission,
      );
    },
  );
};

export const useUpdateRole = () => {
  return useSWRMutation(
    "/admin/update-role",
    async (_key: string, { arg }: { arg: UpdateRoleArgs }) => {
      return updateOrgRoleAction(
        arg.organizationId ?? "",
        arg.roleName ?? "",
        arg.data,
      );
    },
  );
};

export const useDeleteRole = () => {
  return useSWRMutation(
    "/admin/delete-role",
    async (_key: string, { arg }: { arg: DeleteRoleArgs }) => {
      return deleteOrgRoleAction(
        arg.organizationId ?? "",
        arg.roleId ?? "",
      );
    },
  );
};
