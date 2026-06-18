
import { authClient } from "@/lib/auth-client";
import useSWRMutation from "swr/mutation";

export interface UseAdminBanUserArgs {
    userId?: string;
    banReason?: string;
    banExpiresIn?: number;
}

export const useAdminBanUser = () => {
  return useSWRMutation(
    "/admin/ban-user",
    (
      url,
      { arg: { userId, banExpiresIn, banReason } }: {  arg: UseAdminBanUserArgs }
    ) => {
      return authClient.admin.banUser(
        {
          userId,
          banExpiresIn,
          banReason,
        },
        { throw: true },
      );
    },
  );
};
