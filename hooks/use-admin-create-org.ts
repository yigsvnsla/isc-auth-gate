import { authClient } from "@/lib/auth-client";
import useSWRMutation from "swr/mutation";

export interface UseAdminCreateOrganizationArgs {
  name: string;
  slug: string;
  logo?: string;
}

export const useAdminCreateOrganization = () => {
  return useSWRMutation(
    "/organization/create",
    async (_: string, { arg }: { arg: UseAdminCreateOrganizationArgs }) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      return authClient.organization.create({
        name: arg.name,
        slug: arg.slug,
        logo: arg.logo,
        fetchOptions: { throw: true },
      });
    },
  );
};
