import { authClient } from "@/lib/auth-client";
import { APIError } from "better-auth";
import useSWR from "swr";

export const useUserSession = () => {
  return useSWR(
    "/api/get-session",
    async () => {
      const { data, error } = await authClient.getSession({
        query: { disableCookieCache: false, disableRefresh: false },
      });

      if (error) throw error;

      if (!data)
        throw APIError.from("BAD_REQUEST", {
          code: "USER_NOT_FOUND",
          message: "User not found",
        });

      return data;
    },

    {  revalidateOnFocus: false, },
  );
};
