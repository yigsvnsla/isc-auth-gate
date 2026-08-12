import { authClient } from "@/lib/auth/auth-client";
import { OAuthClient } from "@better-auth/oauth-provider";
import { BetterFetchError } from "better-auth/react";
import useSWR from "swr";

export type ListOAuthClientsQuery = Parameters<typeof authClient.oauth2.getClients>[0];

const key = "/oauth2/get-clients";

const fetcher = async (_key: typeof key) => {
  const { data, error } = await authClient.oauth2.getClients();
  if (error) throw error;
  return data;
};


export const useListOAuthClientsQuery = () => {
  return useSWR<OAuthClient[], BetterFetchError, typeof key>(key, fetcher);
};
