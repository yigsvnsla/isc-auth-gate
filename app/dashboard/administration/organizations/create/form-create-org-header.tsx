import { Building2Icon } from "lucide-react";

export const FormCreateOrganizationHeader = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
        <Building2Icon className="size-5 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Organization
        </h1>
        <p className="text-sm text-muted-foreground">
          Set up a new organization and configure its initial settings
        </p>
      </div>
    </div>
  );
};
