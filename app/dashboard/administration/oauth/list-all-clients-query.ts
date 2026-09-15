import useSWR from "swr";
import { listAllOauthClientsAction } from "@/lib/actions/oauth-clients";

export interface AllOauthClientRow {
  clientId: string;
  name: string | null;
  icon: string | null;
  disabled: boolean | null;
  createdAt: Date | null;
  referenceId: string | null;
  userId: string | null;
  orgName: string | null;
  ownerEmail: string | null;
}

const key = "/admin/oauth2/all-clients";

export const useListAllOauthClientsQuery = () => {
  return useSWR<AllOauthClientRow[]>(key, async () => {
    return (await listAllOauthClientsAction()) as AllOauthClientRow[];
  });
};
