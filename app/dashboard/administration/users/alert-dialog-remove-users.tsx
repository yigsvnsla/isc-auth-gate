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
import { useAtomValue, useSetAtom } from "jotai";
import { selectListUsersIdAtom } from "@/atoms/select-list-users-id-atoms";
import { toast } from "@/components/ui/sonner";
import { selectListUsersAtom } from "@/atoms/select-list-users-atom";
import { paramListUsersAtom } from "@/atoms/params-list-users-atom";
import { useAdminListUser } from "@/hooks/use-admin-list-users";
import { useAdminRemoveUser } from "@/hooks/use-admin-remove-user";

export const AlertDialogRemoveUsers: FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const usersList = useAtomValue(selectListUsersIdAtom);
  const setUsersList = useSetAtom(selectListUsersAtom);

  // TODO: Refactorizar esta parte para que pueda usar actualizaciones optimistas sobre el cache de swr
  const params = useAtomValue(paramListUsersAtom);
  const { mutate } = useAdminListUser(params);

  const { trigger, isMutating } = useAdminRemoveUser();

  const handler = (usersIdList: string[]) => {
    return async () => {
      const triggers = usersIdList.map((id) => {
        return trigger({ userId: id });
      });

      toast
        .promise(Promise.all(triggers), {
          loading: `Desactivando ${triggers.length} usuario(s)...`,
          success: `${triggers.length} usuario(s) desactivados(s)}`,
          error: "Error al realizar la operación",
        })
        .unwrap()
        .then(() => {
          mutate();
          setUsersList({});
          setDialogOpen(false);
        });
    };
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger render={children} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Eliminar {usersList.length} usuario(s)?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción es irreversible. Los usuarios serán eliminados
            permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isMutating}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            type="submit"
            disabled={isMutating}
            onClick={handler(usersList)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Activar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
