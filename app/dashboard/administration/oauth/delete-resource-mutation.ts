import { BetterFetchError } from "better-auth/client";
import useSWRMutation from "swr/mutation";

const key = "DELETE /admin/resources/:identifier";

const fetcher = async (_key: string, { arg }: { arg: { identifier: string } }) => {
  const res = await fetch(`/admin/resources/${encodeURIComponent(arg.identifier)}`, {
    method: "DELETE",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error ?? `Failed to delete resource (${res.status})`,
    );
  }
  return data;
};

export const useDeleteResourceMutation = () => {
  return useSWRMutation<unknown, BetterFetchError, typeof key, { identifier: string }>(
    key,
    fetcher,
  );
};