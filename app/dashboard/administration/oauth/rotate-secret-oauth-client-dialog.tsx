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
import { FC, ReactElement } from "react";
import { useRotateSecretOauthClientMutation } from "./rotate-secret-oauth-client-mutation";

export interface RotateSecretOauthClientDialogProps {
  children: ReactElement;
}

export const RotateSecretOauthClientDialog: FC<
  RotateSecretOauthClientDialogProps
> = ({ children }) => {
  const mutation = useRotateSecretOauthClientMutation();

  const rotateSecretHandler = async () => {
    // if (!deleteTarget) return;
    // try {
    //   await mutation.trigger({ client_id: deleteTarget.client_id });
    toast.success(`Client secret rotated`);
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
