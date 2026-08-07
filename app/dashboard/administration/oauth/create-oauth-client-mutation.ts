import { authClient } from "@/lib/auth/auth-client";
import { OAuthClient } from "@better-auth/oauth-provider";
import { BetterFetchError } from "better-auth/client";
import useSWRMutation from "swr/mutation";

export type CreateOauthClient = Parameters<typeof authClient.oauth2.createClient>[0];

interface CreateOauthClientArg {
  arg: CreateOauthClient;
}

const key = "/oauth2/create-client";

const fetcher = async (_key: string, { arg }: CreateOauthClientArg) => {
  const { data, error } = await authClient.oauth2.createClient(arg);
  if (error) throw error;
  return data;
};

export const useCreateOauthClientMutation = () => {
  return useSWRMutation<OAuthClient, BetterFetchError, typeof key, CreateOauthClient>(key, fetcher);
};
