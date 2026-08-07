import { authClient } from "@/lib/auth/auth-client";
import { OAuthClient } from "@better-auth/oauth-provider";
import { BetterFetchError } from "better-auth/client";
import useSWRMutation from "swr/mutation";

export type RotateSecretOauthClient = Parameters<typeof authClient.oauth2.client.rotateSecret>[0];

interface RotateSecretOauthClientArg {
  arg: RotateSecretOauthClient;
}

const key = "/oauth2/rotate-secret";

const fetcher = async (_key: string, { arg }: RotateSecretOauthClientArg) => {
  const { data, error } = await authClient.oauth2.client.rotateSecret(arg);
  if (error) throw error;
  return data;
};

export const useRotateSecretOauthClientMutation = () => {
  return useSWRMutation<OAuthClient, BetterFetchError, typeof key, RotateSecretOauthClient>(key, fetcher);
};


