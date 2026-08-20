import { Button } from "@/components/ui/button";
import { CreateResourceDialog } from "./create-resource-dialog";
import { PlusIcon } from "lucide-react";

export const AuthResourcesPageHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Protected APIs (RFC 8707) that validate the access tokens issued by
        this authorization server. Their identifier travels in the token{" "}
        <code>aud</code> claim.
      </p>

      <CreateResourceDialog>
        <Button size="sm">
          <PlusIcon data-icon="inline-start" />
          New Resource
        </Button>
      </CreateResourceDialog>
    </div>
  );
};