import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Stepper } from "@/components/reui/stepper";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, ReactElement, useState } from "react";
import { toast } from "sonner";
import { useCreateOauthClientMutation } from "./create-oauth-client-mutation";
import { FormProvider, useForm } from "react-hook-form";
import { CreateOauthClientForm } from "./create-oauth-client-form";
import { CreateOauthClientDialogFooter } from "./create-oauth-client-dialog-footer";
import {
  CreateOAuthClientData,
  createOAuthClientDataSchema,
} from "./create-oauth-client-schema";
import { CreateOauthClientDialogHeader } from "./create-oauth-client-dialog-header";

export interface CreateClientDialogProps {
  children: ReactElement;
}

export const CreateClientDialog: FC<CreateClientDialogProps> = ({
  children,
}) => {
  const form = useForm<CreateOAuthClientData>({
    resolver: zodResolver(createOAuthClientDataSchema),
    mode: "onChange",
    defaultValues: {},
  });

  return (
    <Dialog>
      <DialogTrigger render={children} />
      <DialogContent className="flex h-[75vh] flex-col overflow-hidden sm:max-w-4xl">
        <Stepper defaultValue={1} className="flex h-full w-full flex-col gap-4">
          <FormProvider {...form}>
            <CreateOauthClientDialogHeader />

            <CreateOauthClientForm />

            <CreateOauthClientDialogFooter />
          </FormProvider>
        </Stepper>
      </DialogContent>
    </Dialog>
  );
};
