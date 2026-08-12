import { authClient } from "@/lib/auth/auth-client";
import useSWR from "swr";

export type ListOAuthConsentsQuery = Parameters<typeof authClient.oauth2.getConsents>[0];

const key = "/oauth2/get-consents";

const fetcher = async () => {
  const { data, error } = await authClient.oauth2.getConsents();
  if (error) throw error;
  return data;
};

export const useListOAuthConsentsQuery = () => {
  return useSWR(key, fetcher);
};
