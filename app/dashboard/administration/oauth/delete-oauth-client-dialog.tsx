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
import { FC, ReactElement } from "react";
import { useDeleteOauthClientMutation } from "./delete-oauth-client-mutation";
import { toast } from "@/components/ui/sonner";

export interface DeleteOauthClientDialogProps {
  children: ReactElement;
}

export const DeleteOauthClientDialog: FC<DeleteOauthClientDialogProps> = ({
  children,
}) => {
  const mutation = useDeleteOauthClientMutation();

  const deleteClientHandler = async () => {
    // if (!deleteTarget) return;
    // try {
    //   await mutation.trigger({ client_id: deleteTarget.client_id });
    toast.success(`Client deleted`);
    // //   setDeleteTarget(null);
    //   mutate();
    // } catch (err) {
    //   toast.error(err instanceof Error ? err.message : "Failed to delete");
    // }
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
