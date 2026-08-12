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
import { useDeleteOauthClientMutation } from "./delete-oauth-client-mutation";

export interface DeleteOauthClientDialogProps {
  client: OAuthClient;
  children: ReactElement;
}

const clientsKey = "/oauth2/get-clients";

export const DeleteOauthClientDialog: FC<DeleteOauthClientDialogProps> = ({
  client,
  children,
}) => {
  const mutation = useDeleteOauthClientMutation();
  const { mutate } = useSWRConfig();

  const deleteClientHandler = async () => {
    try {
      await mutation.trigger({ client_id: client.client_id });
      toast.success("Cliente eliminado");
      await mutate(clientsKey);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar el cliente",
      );
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger render={children} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete client</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All tokens issued for this client will
            become invalid immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteClientHandler}>
            {mutation.isMutating ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
