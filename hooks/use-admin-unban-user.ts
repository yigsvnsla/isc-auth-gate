import { authClient } from "@/lib/auth-client";
import useSWRMutation from "swr/mutation";

interface UseAdminUnbanUserArgs {
  userId: string;
}

export const useAdminUnbanUser = () => {
  return useSWRMutation(
    "/admin/unban-user",
    (url, { arg: { userId } }: { arg: UseAdminUnbanUserArgs }) => {
      return authClient.admin.unbanUser(
        {
          userId,
        },
        { throw: true },
      );
    },
  );
};
