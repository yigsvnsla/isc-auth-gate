import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Stepper } from "@/components/reui/stepper";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, ReactElement } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { CreateOauthClientForm } from "./create-oauth-client-form";
import { CreateOauthClientDialogFooter } from "./create-oauth-client-dialog-footer";
import {
  CreateOAuthClientData,
  createOAuthClientDataSchema,
} from "./create-oauth-client-schema";
import { CreateOauthClientDialogHeader } from "./create-oauth-client-dialog-header";

export interface CreateClientDialogProps {
  children: ReactElement;
}

export const CreateClientDialog: FC<CreateClientDialogProps> = ({
  children,
}) => {
  const form = useForm<CreateOAuthClientData>({
    resolver: zodResolver(createOAuthClientDataSchema),
    mode: "onChange",
    defaultValues: {
      client_name: "App de Prueba ISC",
      client_uri: "https://miapp.example.com",
      logo_uri: "https://miapp.example.com/logo.png",
      contacts: ["soporte@miapp.example.com"],
      tos_uri: "https://miapp.example.com/terms",
      policy_uri: "https://miapp.example.com/privacy",
      software_id: "com.isc.testapp",
      software_version: "1.0.0",
      metadata: { equipo: "mobile", env: "prod" },
      redirect_uris: ["https://miapp.example.com/callback"],
      post_logout_redirect_uris: ["https://miapp.example.com/logout"],
      scope: "openid profile email offline_access",
      token_endpoint_auth_method: "client_secret_basic",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      type: "web",
      client_secret_expires_at: 0,
      skip_consent: false,
      enable_end_session: true,
      require_pkce: true,
      subject_type: "public",
    },
  });

  return (
    <Dialog>
      <DialogTrigger render={children} />
      <DialogContent
        showCloseButton={false}
        className="flex h-[75vh] flex-col overflow-hidden sm:max-w-4xl"
      >
        <Stepper defaultValue={1} className="flex h-full w-full flex-col gap-4">
          <FormProvider {...form}>
            <CreateOauthClientDialogHeader />

            <CreateOauthClientForm />

            <CreateOauthClientDialogFooter />
          </FormProvider>
        </Stepper>
      </DialogContent>
    </Dialog>
  );
};
