"use client";

import { authClient } from "@workspace/auth-config/lib/client";
import { NavUser } from "./nav-user";
import useSWR from "swr";
import { NavUserSkeleton } from "./nav-user-skeleton";

export const NavUserContainer = () => {
  const { data, isLoading } = useSWR(
    "/api/get-session",
    async () => {
      const session = await authClient.getSession();
      return session?.data;
    },
    { suspense: true, fallbackData: null },
  );

  return isLoading ? (
    <NavUserSkeleton />
  ) : (
    <NavUser
      user={{
        avatar: data?.user.image ?? "",
        name: data?.user.name ?? "",
        email: data?.user.email ?? "",
      }}
    />
  );
};
