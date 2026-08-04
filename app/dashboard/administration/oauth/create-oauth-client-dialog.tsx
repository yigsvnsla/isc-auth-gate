import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, ReactElement } from "react";
import { useCreateOauthClientMutation } from "./create-oauth-client-mutation";
import { FormProvider, useForm } from "react-hook-form";
import { CreateOauthClientForm } from "./create-oauth-client-form";
import {
  CreateOAuthClientData,
  createOAuthClientDataSchema,
} from "./create-oauth-client-schema";

export interface CreateClientDialogProps {
  children: ReactElement;
}

export const CreateClientDialog: FC<CreateClientDialogProps> = ({
  children,
}) => {
  const createMutation = useCreateOauthClientMutation();
  const form = useForm({
    resolver: zodResolver(createOAuthClientDataSchema),
    defaultValues: {},
  });

  function handleSubmit(value: CreateOAuthClientData) {
    console.log(value);

    return;
  }

  return (
    <Dialog>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-4xl">
        <FormProvider {...form}>
          <CreateOauthClientForm />
        </FormProvider>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={createMutation.isMutating}
          >
            {createMutation.isMutating ? "Creating..." : "Create Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
