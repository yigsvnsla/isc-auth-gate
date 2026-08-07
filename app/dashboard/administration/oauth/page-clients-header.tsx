import { Button } from "@/components/ui/button";
import { CreateClientDialog } from "./create-oauth-client-dialog";
import { PlusIcon } from "lucide-react";

export const AuthClientsPageHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        OAuth 2.1 clients registered in this authorization server. Third-party
        apps use these credentials to authenticate users.
      </p>

      {/* CREATE CLIENT DIALOG */}
      <CreateClientDialog>
        <Button size="sm">
          <PlusIcon data-icon="inline-start" />
          New Client
        </Button>
      </CreateClientDialog>
    </div>
  );
};
