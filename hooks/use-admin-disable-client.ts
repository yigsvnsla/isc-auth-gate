import { useSWRConfig } from "swr";

export interface DisableClientArg {
  clientId: string;
  disabled: boolean;
}

export const useAdminDisableClient = () => {
  const { mutate } = useSWRConfig();

  const disableClient = async ({ clientId, disabled }: DisableClientArg) => {
    const response = await fetch(`/api/admin/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disabled }),
    });
    if (!response.ok) {
      throw new Error(`Failed to ${disabled ? "disable" : "enable"} client`);
    }
    await mutate(["/oauth2/get-clients"]);
    await mutate(["/oauth2/get-client", clientId]);
    return response.json();
  };

  return { disableClient };
};
