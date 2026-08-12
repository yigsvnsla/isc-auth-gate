import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { OAuthClient } from "@better-auth/oauth-provider";
import { FC, ReactElement } from "react";
import { useSWRConfig } from "swr";
import { useRotateSecretOauthClientMutation } from "./rotate-secret-oauth-client-mutation";

export interface RotateSecretOauthClientDialogProps {
  client: OAuthClient;
  children: ReactElement;
}

const clientsKey = "/oauth2/get-clients";

export const RotateSecretOauthClientDialog: FC<
  RotateSecretOauthClientDialogProps
> = ({ client, children }) => {
  const mutation = useRotateSecretOauthClientMutation();
  const { mutate } = useSWRConfig();

  const rotateSecretHandler = async () => {
    try {
      await mutation.trigger({ client_id: client.client_id });
      toast.success("Client secret rotado");
      await mutate(clientsKey);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al rotar el secret",
      );
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger render={children} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rotate secret?</AlertDialogTitle>
          <AlertDialogDescription>
            The current client secret will be invalidated immediately.
            Applications using this client will need to update their
            configuration.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={rotateSecretHandler}>
            {mutation.isMutating ? "Rotating..." : "Rotate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
