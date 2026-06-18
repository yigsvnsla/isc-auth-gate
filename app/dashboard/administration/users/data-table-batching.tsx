import { Button } from "@/components/ui/button";
import { CheckCircleIcon, BanIcon, Trash2Icon } from "lucide-react";
import { FC } from "react";
import { useAtomValue } from "jotai";
import { AlertDialogBanUsers } from "./alert-dialog-ban-users";
import { AlertDialogUnBanUsers } from "./alert-dialog-unban-users";
import { AlertDialogRemoveUsers } from "./alert-dialog-remove-users";
import { selectListUsersIdAtom } from "@/atoms/select-list-users-id-atoms";
import { cn } from "@/lib/utils";

export const UserListDataTableBatching: FC = () => {
  const usersList = useAtomValue(selectListUsersIdAtom);
  const hasSelection = !(usersList.length > 0);

  return (
    <div className="mb-2 flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2">
      <span
        className={cn(hasSelection && "text-accent-foreground/50", "text-sm font-medium")}
      >
        <CheckCircleIcon className="mr-2 inline-block size-4" />
        {usersList.length} usuario(s) seleccionado(s)
      </span>
      <div className="flex items-center gap-2">
        <AlertDialogBanUsers>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={hasSelection}
          >
            <BanIcon className="size-4" />
            Bloquear
          </Button>
        </AlertDialogBanUsers>

        <AlertDialogUnBanUsers>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={hasSelection}
          >
            <CheckCircleIcon className="size-4" />
            Activar
          </Button>
        </AlertDialogUnBanUsers>

        <AlertDialogRemoveUsers>
          <Button
            size="sm"
            variant="outline"
            disabled={hasSelection}
            className="gap-1.5 text-destructive hover:text-destructive"
          >
            <Trash2Icon className="size-4" />
            Eliminar
          </Button>
        </AlertDialogRemoveUsers>
      </div>
    </div>
  );
};
