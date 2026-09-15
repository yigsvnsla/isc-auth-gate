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
import React, { FC, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth/auth-client";
import { useOrganizations } from "@/hooks/use-admin-roles";
import { useSetAtom } from "jotai";
import { selectListOrgsAtom } from "@/atoms/select-list-orgs-atom";

interface AlertDialogRemoveOrgsProps {
  orgsIdList: string[];
  children: React.ReactElement;
}

export const AlertDialogRemoveOrgs: FC<AlertDialogRemoveOrgsProps> = ({
  orgsIdList,
  children,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const setSelection = useSetAtom(selectListOrgsAtom);
  const { mutate } = useOrganizations();

  const handler = async () => {
    const results = await Promise.allSettled(
      orgsIdList.map((organizationId) =>
        authClient.organization.delete({
          organizationId,
          fetchOptions: { throw: true },
        }),
      ),
    );

    const failed = results.filter((r) => r.status === "rejected");
    const removed = results.length - failed.length;

    if (removed > 0) {
      toast.success(`${removed} organización(es) eliminada(s) correctamente`);
      mutate();
    }
    if (failed.length > 0) {
      const firstError = failed[0];
      const message =
        firstError.status === "rejected" && firstError.reason instanceof Error
          ? firstError.reason.message
          : "Error desconocido";
      toast.error(
        `${failed.length} organización(es) no pudieron eliminarse. ${message}`,
      );
    }

    setSelection({});
    setDialogOpen(false);
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger render={children} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Eliminar {orgsIdList.length} organización(es)?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción es irreversible. Se eliminarán permanentemente las
            organizaciones junto con sus miembros e invitaciones.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handler}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
