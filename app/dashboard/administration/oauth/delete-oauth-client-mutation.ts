import { authClient } from "@/lib/auth/auth-client";
import { BetterFetchError } from "better-auth/client";
import useSWRMutation from "swr/mutation";

export type DeleteOauthClient = Parameters<typeof authClient.oauth2.deleteClient>[0];

interface DeleteOauthClientArg {
  arg: DeleteOauthClient;
}

const key = "/oauth2/delete-client";

const fetcher = async (_key: string, { arg }: DeleteOauthClientArg) => {
  const { data, error } = await authClient.oauth2.deleteClient(arg);
  if (error) throw error;
  return data;
};

export const useDeleteOauthClientMutation = () => {
  return useSWRMutation<void, BetterFetchError, typeof key, DeleteOauthClient>(key, fetcher);
};
