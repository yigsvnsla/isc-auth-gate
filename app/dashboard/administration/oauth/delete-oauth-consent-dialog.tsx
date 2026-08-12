"use client";

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
import { OAuthConsent } from "@better-auth/oauth-provider";
import { FC, ReactElement } from "react";
import { useSWRConfig } from "swr";
import { useDeleteOauthConsentMutation } from "./delete-oauth-consent-mutation";

export interface DeleteOauthConsentDialogProps {
  consent: OAuthConsent;
  children: ReactElement;
}

const consentsKey = "/oauth2/get-consents";

export const DeleteOauthConsentDialog: FC<DeleteOauthConsentDialogProps> = ({
  consent,
  children,
}) => {
  const mutation = useDeleteOauthConsentMutation();
  const { mutate } = useSWRConfig();

  const revokeHandler = async () => {
    try {
      await mutation.trigger({ id: consent.id });
      toast.success("Consent revoked");
      await mutate(consentsKey);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to revoke consent",
      );
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger render={children} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke consent?</AlertDialogTitle>
          <AlertDialogDescription>
            The app will need the user to re-authorize the next time it
            requests access. Tokens already issued remain valid until they
            expire.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={revokeHandler}>
            {mutation.isMutating ? "Revoking..." : "Revoke"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
