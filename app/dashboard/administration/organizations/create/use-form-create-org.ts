import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formCreateOrganizationBasicSchema } from "./form-create-org.schema";
import z from "zod";
import { useAdminCreateOrganization } from "@/hooks/use-admin-create-org";

const formSchema = formCreateOrganizationBasicSchema;

export const useFormCreateOrganization = () => {
  const { isMutating } = useAdminCreateOrganization();

  const DICEBEAR_BASE_URL = "https://api.dicebear.com/9.x/identicon/svg";
  const seed = crypto.randomUUID();
  const params = new URLSearchParams({ seed });
  const logoOrg = `${DICEBEAR_BASE_URL}?${params.toString()}`;

  return useForm<z.infer<typeof formCreateOrganizationBasicSchema>>({
    mode: "onChange",
    disabled: isMutating,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "isc organization name example",
      slug: "",
      logo: logoOrg,
    },
  });
};
