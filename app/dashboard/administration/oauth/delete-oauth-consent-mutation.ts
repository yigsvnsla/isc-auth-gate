import { authClient } from "@/lib/auth/auth-client";
import { BetterFetchError } from "better-auth/client";
import useSWRMutation from "swr/mutation";

export type DeleteOauthConsent = Parameters<typeof authClient.oauth2.deleteConsent>[0];

interface DeleteOauthConsentArg {
  arg: DeleteOauthConsent;
}

const key = "/oauth2/delete-consent";

const fetcher = async (_key: string, { arg }: DeleteOauthConsentArg) => {
  const { data, error } = await authClient.oauth2.deleteConsent(arg);
  if (error) throw error;
  return data;
};

export const useDeleteOauthConsentMutation = () => {
  return useSWRMutation<void, BetterFetchError, typeof key, DeleteOauthConsent>(key, fetcher);
};
