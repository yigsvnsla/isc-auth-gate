"use client";

import { authClient } from "@/lib/auth-client";
import { NavUser } from "./nav-user";
import useSWR from "swr";
import { NavUserSkeleton } from "./nav-user-skeleton";

export const NavUserContainer = () => {
  const { data, isLoading } = useSWR(
    "/api/get-session",
    async () => await authClient.getSession({}, { throw: true }),
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
