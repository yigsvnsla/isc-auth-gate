"use client";

import { authClient } from "@/lib/auth-client";
import useSWRMutation from "swr/mutation";

export interface UseAdminCreateUserArgs {
  email: string;
  password: string;
  name: string;
  role?: "user" | "moderator" | "admin";
  sendVerificationEmail?: boolean;
  // TODO: Implementar cuando SMTP esté configurado
  // sendWelcomeEmail?: boolean;
}

export const useAdminCreateUser = () => {
  return useSWRMutation(
    "/admin/create-user",
    (url, { arg }: { arg: UseAdminCreateUserArgs }) => {
      return authClient.admin.createUser(
        {
          email: arg.email,
          password: arg.password,
          name: arg.name,
          role: arg.role || "user",
        },
        { throw: true },
      );
    },
  );
};
