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
import { FC, ReactElement, useState } from "react";
import { useSWRConfig } from "swr";
import { GlobalConsentRow, revokeGlobalConsent } from "./list-oauth-consents-global-query";

export interface DeleteGlobalConsentDialogProps {
  consent: GlobalConsentRow;
  children: ReactElement;
}

const consentsKey = "/api/admin/consents";

export const DeleteGlobalConsentDialog: FC<DeleteGlobalConsentDialogProps> = ({
  consent,
  children,
}) => {
  const { mutate } = useSWRConfig();
  const [isMutating, setIsMutating] = useState(false);

  const revokeHandler = async () => {
    setIsMutating(true);
    try {
      await revokeGlobalConsent(consent.id);
      toast.success("Consent revocado");
      await mutate(consentsKey);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al revocar el consent",
      );
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger render={children} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revocar consent?</AlertDialogTitle>
          <AlertDialogDescription>
            {consent.userEmail || "El usuario"} perderá la autorización
            otorgada a {consent.clientName || consent.clientId}. La app deberá
            solicitar autorización nuevamente en el próximo acceso.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={revokeHandler}>
            {isMutating ? "Revocando..." : "Revocar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
