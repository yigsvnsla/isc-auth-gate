import { BetterFetchError } from "better-auth/react";
import useSWR from "swr";

export interface GlobalConsentRow {
  id: string;
  clientId: string;
  clientName: string | null;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  scopes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const key = "/api/admin/consents";

const fetcher = async () => {
  const response = await fetch(key, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load consents (${response.status})`);
  }
  return (await response.json()) as GlobalConsentRow[];
};

export const useListOAuthConsentsGlobalQuery = () => {
  return useSWR<GlobalConsentRow[], BetterFetchError>(key, fetcher);
};

export const revokeGlobalConsent = async (id: string) => {
  const response = await fetch(key, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error(`Failed to revoke consent (${response.status})`);
  }
};
