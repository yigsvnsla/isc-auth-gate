import { authClient } from "@/lib/auth/auth-client";
import { BetterFetchError } from "better-auth/client";
import useSWRMutation from "swr/mutation";

export type AdminUpdateUser = Parameters<typeof authClient.admin.updateUser>[0];

interface AdminUpdateUserArg {
  arg: AdminUpdateUser;
}

const key = "/admin/update-user";

const fetcher = async (_key: string, { arg }: AdminUpdateUserArg) => {
  const { data, error } = await authClient.admin.updateUser(arg);
  if (error) throw error;
  return data;
};

export const useAdminUpdateUser = () => {
  return useSWRMutation(key, fetcher);
};

export type { BetterFetchError };
