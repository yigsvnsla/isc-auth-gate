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
import { FC, useCallback, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";
import { useAtom, useAtomValue } from "jotai";
import { selectListUsersAtom } from "@/atoms/select-list-users-atom";
import { mutate } from "swr";
import { paramListUsersAtom } from "@/atoms/params-list-users-atom";
import { UserWithRole } from "better-auth/plugins";
import { RowSelectionState } from "@tanstack/react-table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@base-ui/react";
import { string } from "better-auth";

enum LIST_USERS_BATCH_ACTIONS {
  BAN_USERS,
  UNBAN_USERS,
  DELETE_USERS,
}

const bannedTimes = [
  { label: "indefinido", value: null },
  { label: "1 dia", value: "1" },
  { label: "1 mes", value: "2" },
  { label: "1 año", value: "3" },
];

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
  const [expiresIn, setExpiresIn] = useState("");
  // const [params] = useAtom(paramListUsersAtom);
  const selectionList = Object.keys(useAtomValue(selectListUsersAtom)).filter(
    (id, i, arr) => arr[i],
  );

  // const selectionList = 0;
  const handleBatchAction = useCallback(
    (action: LIST_USERS_BATCH_ACTIONS, list: string[]) => {
      // const promisedActions = selectionList.map((userId) => {
      //   // switch (action) {
      //   //   case LIST_USERS_BATCH_ACTIONS.UNBAN_USERS:
      //   //     return authClient.admin.unbanUser({ userId });
      //   //   case LIST_USERS_BATCH_ACTIONS.DELETE_USERS:
      //   //     return authClient.admin.removeUser({ userId });
      //   //   case LIST_USERS_BATCH_ACTIONS.BAN_USERS:
      //   //     return authClient.admin.banUser({
      //   //       userId,
      //   //       banReason,
      //   //       banExpiresIn,
      //   //     });
      //   //   default:
      //   //     throw new Error("LIST_USERS_BATCH_ACTIONS not implement");
      //   // }
      // });

      return () => {
        console.log("BATCH ACTION", selectionList);

        // toast
        //   .promise(Promise.all(promisedActions), {
        //     loading: `${actionMessage[action]} ${promisedActions.length} usuario(s)...`,
        //     success: `${promisedActions.length} usuario(s) ${actionsMessage[action]}`,
        //     error: "Error al realizar la operación",
        //   })
        //   .unwrap()
        //   .then(() => {
        //     // setSelection({});
        //     // mutate(["/admin/list-users", params]);
        //   });
      };
    },
    [selectionList],
  );

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
        {selectionList.length} usuario(s) seleccionado(s)
      </span>
      <div className="flex items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="outline" size="sm" className="gap-1.5">
                <BanIcon className="size-4" />
                Bloquear
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Desea bloquear a {selectionList?.length} usuario(s)?
              </AlertDialogTitle>

              <AlertDialogDescription>
                Los usuarios seleccionados no podrán iniciar sesión hasta que
                sean aktivados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <FieldGroup className="w-full gap-4">
              <Field orientation="vertical">
                <FieldContent>
                  <FieldLabel htmlFor="banReason">Ban Reason</FieldLabel>
                  <FieldDescription>
                    Describe la razon del bloqueo.
                  </FieldDescription>
                </FieldContent>
                <Textarea
                  id="banReason"
                  defaultValue="Bloqueo administrativo por [Jesus Guzman]"
                />
              </Field>
              <Field>
                <FieldContent>
                  <FieldLabel htmlFor="banExpiresIn">Ban Expires In</FieldLabel>
                  <FieldDescription>
                    Establece el tiempo de bloqueo
                  </FieldDescription>
                </FieldContent>
                <Select items={bannedTimes} defaultValue={null}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tiempo de bloqueo" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger>
                    <SelectGroup>
                      {bannedTimes.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBatchAction(
                  LIST_USERS_BATCH_ACTIONS.BAN_USERS,
                  selectionList,
                )}
              >
                Bloquear
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
                Activar {selectionList.length} usuario(s)?
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
                  selectionList,
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
                Eliminar {selectionList.length} usuario(s)?
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
