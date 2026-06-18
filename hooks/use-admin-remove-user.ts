import { authClient } from "@/lib/auth-client";
import useSWRMutation from "swr/mutation";

interface UseAdminRemoveUserArgs {
  userId: string;
}

export const useAdminRemoveUser = () => {
  return useSWRMutation(
    "/admin/remove-user",
    (url, { arg: { userId } }: { arg: UseAdminRemoveUserArgs }) => {
      return authClient.admin.removeUser(
        {
          userId,
        },
        { throw: true },
      );
    },
  );
};
