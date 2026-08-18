import { useSWRConfig } from "swr";
import useSWR from "swr";

export interface AdminUserConsent {
  id: string;
  clientId: string;
  clientName: string | null;
  userId: string | null;
  scopes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const keyFor = (userId: string) => `/api/admin/users/${userId}/consents`;

const fetcher = async (key: string) => {
  const response = await fetch(key, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load consents (${response.status})`);
  }
  return (await response.json()) as AdminUserConsent[];
};

export const useAdminUserConsentsQuery = (userId: string | undefined) => {
  return useSWR<AdminUserConsent[]>(
    userId ? keyFor(userId) : null,
    fetcher,
  );
};

export const useAdminUserConsentsActions = (userId: string) => {
  const { mutate } = useSWRConfig();
  const key = keyFor(userId);

  const createConsent = async (arg: {
    clientId: string;
    scopes: string[];
  }) => {
    const response = await fetch(key, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(arg),
    });
    if (!response.ok) throw new Error("Failed to create consent");
    await mutate(key);
    return response.json();
  };

  const updateConsent = async (arg: {
    consentId: string;
    scopes: string[];
  }) => {
    const response = await fetch(`${key}/${arg.consentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scopes: arg.scopes }),
    });
    if (!response.ok) throw new Error("Failed to update consent");
    await mutate(key);
    return response.json();
  };

  const deleteConsent = async (consentId: string) => {
    const response = await fetch(`${key}/${consentId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to revoke consent");
    await mutate(key);
  };

  return { createConsent, updateConsent, deleteConsent };
};
