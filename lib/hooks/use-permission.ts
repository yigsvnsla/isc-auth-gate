"use client";

import useSWR from "swr";
import { authClient } from "@/lib/auth/auth-client";

type PermissionKey = `${string}.${string}`;

export function usePermission(permission: PermissionKey) {
  const [resource, action] = permission.split(".");
  const { data, isLoading, error, mutate } = useSWR(
    `permission:${permission}`,
    async () => {
      const res = await authClient.admin.hasPermission({
        permissions: { [resource]: [action] },
      });
      return res.data?.success ?? false;
    },
    { revalidateOnFocus: false, dedupingInterval: 30_000 },
  );

  return {
    hasPermission: data ?? false,
    isLoading,
    error,
    mutate,
  };
}

export function usePermissions(permissions: PermissionKey[]) {
  const key = `permissions:${permissions.sort().join(",")}`;
  const { data, isLoading, error, mutate } = useSWR(
    key,
    async () => {
      const results = await Promise.all(
        permissions.map(async (p) => {
          const [resource, action] = p.split(".");
          const res = await authClient.admin.hasPermission({
            permissions: { [resource]: [action] },
          });
          return { permission: p, allowed: res.data?.success ?? false };
        }),
      );
      return Object.fromEntries(results.map((r) => [r.permission, r.allowed]));
    },
    { revalidateOnFocus: false, dedupingInterval: 30_000 },
  );

  return {
    all: data ? Object.values(data).every(Boolean) : false,
    any: data ? Object.values(data).some(Boolean) : false,
    results: data ?? {},
    isLoading,
    error,
    mutate,
  };
}