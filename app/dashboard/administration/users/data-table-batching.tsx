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
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, BanIcon, Trash2Icon } from "lucide-react";
import { FC, useCallback } from "react";
import { toast } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";
import { useAtom, useAtomValue } from "jotai";
import { selectListUsersAtom } from "@/atoms/select-list-users-atom";
import { mutate } from "swr";
import { paramListUsersAtom } from "@/atoms/params-list-users-atom";

enum LIST_USERS_BATCH_ACTIONS {
  BAN_USERS,
  UNBAN_USERS,
  DELETE_USERS,
}

const actionMessage = {
  [LIST_USERS_BATCH_ACTIONS.BAN_USERS]: "Desactivando",
  [LIST_USERS_BATCH_ACTIONS.UNBAN_USERS]: "Activando",
  [LIST_USERS_BATCH_ACTIONS.DELETE_USERS]: "Eliminando",
};

const actionsMessage = {
  [LIST_USERS_BATCH_ACTIONS.BAN_USERS]: "desactivados(s)",
  [LIST_USERS_BATCH_ACTIONS.UNBAN_USERS]: "activado(s)",
  [LIST_USERS_BATCH_ACTIONS.DELETE_USERS]: "eliminado(s)",
};

export const UserListDataTableBatching: FC = () => {
  const banReason = "";
  const banExpiresIn = 0;
  const [params] = useAtom(paramListUsersAtom);

  const selection = useAtomValue(selectListUsersAtom);
  const selectionList = 0;
  const handleBatchAction = useCallback((action: LIST_USERS_BATCH_ACTIONS) => {
    console.log("BATCH ACTION");

    const selectionList = Object.keys(selection).filter((id) => selection[id]);
    const promisedActions = selectionList.map((userId) => {
      // switch (action) {
      //   case LIST_USERS_BATCH_ACTIONS.UNBAN_USERS:
      //     return authClient.admin.unbanUser({ userId });
      //   case LIST_USERS_BATCH_ACTIONS.DELETE_USERS:
      //     return authClient.admin.removeUser({ userId });
      //   case LIST_USERS_BATCH_ACTIONS.BAN_USERS:
      //     return authClient.admin.banUser({
      //       userId,
      //       banReason,
      //       banExpiresIn,
      //     });
      //   default:
      //     throw new Error("LIST_USERS_BATCH_ACTIONS not implement");
      // }
    });

    return () => {
      toast
        .promise(Promise.all(promisedActions), {
          loading: `${actionMessage[action]} ${promisedActions.length} usuario(s)...`,
          success: `${promisedActions.length} usuario(s) ${actionsMessage[action]}`,
          error: "Error al realizar la operación",
        })
        .unwrap()
        .then(() => {
          // setSelection({});
          // mutate(["/admin/list-users", params]);
        });
    };
  }, []);

  // const handleBatchAction = useCallback(
  //   (action: "removeUser" | "unbanUser" | "banUser") => {
  //     const promisedActions = selectionList.map((userId) =>
  //       authClient.admin[`${action}`]({ userId }),
  //     );
  //     return async () => {
  //       toast.promise(Promise.all(promisedActions), {
  //         loading: `${action === "ban" ? "Baneando" : action === "unbanUser" ? "Activando" : "Eliminando"} ${promisedActions.length} usuario(s)...`,
  //         success: `${promisedActions.length} usuario(s) ${action === "ban" ? "baneado(s)" : action === "unban" ? "activado(s)" : "eliminado(s)"}`,
  //         error: "Error al realizar la operación",
  //       });
  //     };
  //   },
  //   [selectionList],
  // );

  // const handleBatchActions = useCallback(
  //   async (action: "ban" | "unban" | "delete", userIds: string[]) => {
  //     toast.promise(
  //       (async () => {
  //         const promises = userIds.map((userId) => {
  //           if (action === "ban") {
  //             return authClient.admin["banUser"]({ userId });
  //           } else if (action === "unban") {
  //             return authClient.admin.unbanUser({ userId });
  //           } else {
  //             return authClient.admin.removeUser({ userId });
  //           }
  //         });
  //         await Promise.all(promises);
  //         startTransition(() => {
  //           // setRowSelection({});
  //           // mutate(["/admin/list-users", params]);
  //         });
  //       })(),
  //       {
  //         loading: `${action === "ban" ? "Baneando" : action === "unban" ? "Activando" : "Eliminando"} ${userIds.length} usuario(s)...`,
  //         success: `${userIds.length} usuario(s) ${action === "ban" ? "baneado(s)" : action === "unban" ? "activado(s)" : "eliminado(s)"}`,
  //         error: "Error al realizar la operación",
  //       },
  //     );
  //   },
  //   [],
  // );

  return (
    <div className="mb-2 flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2">
      <span className="text-sm font-medium">
        <CheckCircleIcon className="mr-2 inline-block size-4" />
        {"selectionList.length"} usuario(s) seleccionado(s)
      </span>
      <div className="flex items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="outline" size="sm" className="gap-1.5">
                <BanIcon className="size-4" />
                Banear
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Banear {"selectionList?.length"} usuario(s)?
              </AlertDialogTitle>
              dasdsa
              <AlertDialogDescription>
                Los usuarios seleccionados no podrán iniciar sesión hasta que
                sean aktivados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBatchAction(LIST_USERS_BATCH_ACTIONS.BAN_USERS)}
              >
                Banear
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="outline" size="sm" className="gap-1.5">
                <CheckCircleIcon className="size-4" />
                Activar
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Activar {"selectionList.length"} usuario(s)?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Se removerá el bloqueo de los usuarios seleccionados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBatchAction(
                  LIST_USERS_BATCH_ACTIONS.UNBAN_USERS,
                )}
              >
                Activar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
              >
                <Trash2Icon className="size-4" />
                Eliminar
              </Button>
            }
          />

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Eliminar {"selectionList.length"} usuario(s)?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción es irreversible. Los usuarios serán eliminados
                permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                // onClick={() =>
                //   handleBatchAction(
                //     "delete",
                //     selectedUsers.map((u) => u.id),
                //   )
                // }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
