import { authClient } from "@/lib/auth/auth-client";
import { OAuthClient } from "@better-auth/oauth-provider";
import { BetterFetchError } from "better-auth/client";
import useSWRMutation from "swr/mutation";

export type UpdateOauthClient = Parameters<typeof authClient.oauth2.updateClient>[0];

interface UpdateOauthClientArg {
  arg: UpdateOauthClient;
}

const key = "/oauth2/update-client";

const fetcher = async (_key: string, { arg }: UpdateOauthClientArg) => {
  const { data, error } = await authClient.oauth2.updateClient(arg);
  if (error) throw error;
  return data;
};

export const useUpdateOauthClientMutation = () => {
  return useSWRMutation<OAuthClient, BetterFetchError, typeof key, UpdateOauthClient>(key, fetcher);
};
