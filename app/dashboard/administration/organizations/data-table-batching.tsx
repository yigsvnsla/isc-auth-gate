import { Button } from "@/components/ui/button";
import { Trash2Icon, CheckCircleIcon } from "lucide-react";
import { FC } from "react";
import { useAtomValue } from "jotai";
import { AlertDialogRemoveOrgs } from "./alert-dialog-remove-orgs";
import { selectListOrgsIdAtom } from "@/atoms/select-list-orgs-id-atom";
import { cn } from "@/lib/utils";

export const OrganizationsDataTableBatching: FC = () => {
  const orgsList = useAtomValue(selectListOrgsIdAtom);
  const hasSelection = !(orgsList.length > 0);

  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2">
      <span
        className={cn(
          hasSelection && "text-accent-foreground/50",
          "text-sm font-medium",
        )}
      >
        <CheckCircleIcon className="mr-2 inline-block size-4" />
        {orgsList.length} organización(es) seleccionada(s)
      </span>
      <div className="flex items-center gap-2">
        <AlertDialogRemoveOrgs orgsIdList={orgsList}>
          <Button
            size="sm"
            variant="outline"
            disabled={hasSelection}
            aria-label="Eliminar organizaciones seleccionadas"
          >
            <Trash2Icon className="text-destructive"/>
            <span className="hidden sm:inline">Eliminar</span>
          </Button>
        </AlertDialogRemoveOrgs>
      </div>
    </div>
  );
};
