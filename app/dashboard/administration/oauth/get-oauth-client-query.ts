import { authClient } from "@/lib/auth/auth-client";
import { OAuthClient } from "@better-auth/oauth-provider";
import { BetterFetchError } from "better-auth/react";
import useSWR from "swr";

const key = "/oauth2/get-client";

const fetcher = async (clientId: string) => {
  const { data, error } = await authClient.oauth2.getClient({
    query: { client_id: clientId },
  });
  if (error) throw error;
  return data;
};

export const useGetOAuthClientQuery = (clientId: string | undefined) => {
  return useSWR<OAuthClient, BetterFetchError>(
    clientId ? [key, clientId] : null,
    () => fetcher(clientId!),
  );
};
