"use client";

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
import { toast } from "@/components/ui/sonner";
import { OAuthResource } from "@better-auth/oauth-provider";
import { FC, ReactElement } from "react";
import { useSWRConfig } from "swr";
import { useDeleteResourceMutation } from "./delete-resource-mutation";
import { resourcesKey } from "./list-resources-query";

export interface DeleteResourceDialogProps {
  resource: OAuthResource;
  children: ReactElement;
}

export const DeleteResourceDialog: FC<DeleteResourceDialogProps> = ({
  resource,
  children,
}) => {
  const mutation = useDeleteResourceMutation();
  const { mutate } = useSWRConfig();

  const deleteHandler = async () => {
    try {
      await mutation.trigger({ identifier: resource.identifier });
      await mutate(resourcesKey);
      toast.success("Resource eliminado");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar el resource",
      );
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger render={children} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete resource</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Los clients vinculados a este
            resource dejarán de poder solicitar tokens para él.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteHandler}>
            {mutation.isMutating ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};