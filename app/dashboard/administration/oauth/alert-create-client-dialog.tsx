import { FC, PropsWithChildren } from "react";

export const CreateClientDialog: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Dialog >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create OAuth Client</DialogTitle>
          <DialogDescription>
            Register a new OAuth 2.1 client application.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="client-name">Client Name</FieldLabel>
            <Input
              id="client-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My App"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="redirect-uris">
              Redirect URIs <span className="text-destructive">*</span>
            </FieldLabel>
            <textarea
              id="redirect-uris"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={redirectUris}
              onChange={(e) => setRedirectUris(e.target.value)}
              placeholder="https://app.example.com/callback"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              One URI per line
            </p>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isMutating}>
            {createMutation.isMutating ? "Creating..." : "Create Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
