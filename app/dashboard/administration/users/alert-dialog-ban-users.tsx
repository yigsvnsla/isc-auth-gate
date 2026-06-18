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
import {
  FieldGroup,
  FieldContent,
  Field,
  FieldDescription,
  FieldLabel,
  FieldSet,
  FieldError,
} from "@/components/ui/field";
import { SelectContent } from "@/components/ui/select";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import React, { FC, useId, useState } from "react";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { addDays, addMonths, addYears, differenceInSeconds } from "date-fns";
import {
  useAdminBanUser,
  UseAdminBanUserArgs,
} from "@/hooks/use-admin-ban-user";
import { useAtomValue, useSetAtom } from "jotai";
import { selectListUsersIdAtom } from "@/atoms/select-list-users-id-atoms";
import { toast } from "@/components/ui/sonner";
import { selectListUsersAtom } from "@/atoms/select-list-users-atom";
import { paramListUsersAtom } from "@/atoms/params-list-users-atom";
import { useAdminListUser } from "@/hooks/use-admin-list-users";
import { useUserSession } from "@/hooks/use-user-session";
export const bannedTimes = [
  {
    label: "Indefinido",
    value: "undefined",
  },
  {
    label: "1 día",
    value: differenceInSeconds(addDays(new Date(), 1), new Date()).toString(),
  },
  {
    label: "1 mes",
    // Usamos date-fns para ser precisos con meses de 28, 30 o 31 días
    value: differenceInSeconds(addMonths(new Date(), 1), new Date()).toString(),
  },
  {
    label: "1 año",
    value: differenceInSeconds(addYears(new Date(), 1), new Date()).toString(),
  },
];
const formSchema = z.object({
  banReason: z
    .string()
    .min(5, "Bug title must be at least 5 characters.")
    .max(100, "Description must be at most 100 characters."),
  banExpiresIn: z.string(),
});

export const AlertDialogBanUsers: FC<{ children: React.ReactElement }> = ({
  children,
}) => {

  const id_component = useId()

  const [dialogOpen, setDialogOpen] = useState(false);

  const usersList = useAtomValue(selectListUsersIdAtom);
  const setUsersList = useSetAtom(selectListUsersAtom);

  // TODO: Refactorizar esta parte para que pueda usar actualizaciones optimistas sobre el cache de swr
  const params = useAtomValue(paramListUsersAtom);
  const { mutate } = useAdminListUser(params);

  const { data } = useUserSession();
  const { trigger, isMutating } = useAdminBanUser();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    values: {
      banReason: `Bloqueo administrativo realizado por ${data?.user.name}`,
      banExpiresIn: "undefined",
    },
  });

  const handler = (usersIdList: string[]) => {
    return async (form: z.infer<typeof formSchema>) => {
      const triggers = usersIdList.map((id) => {
        const request: UseAdminBanUserArgs = {
          userId: id,
          banReason: form.banReason,
        };

        if (form.banExpiresIn !== "undefined") {
          request.banExpiresIn = Number(form.banExpiresIn);
        }

        return trigger(request);
      });

      toast
        .promise(Promise.all(triggers), {
          loading: `Desactivando ${triggers.length} usuario(s)...`,
          success: `${triggers.length} usuario(s) desactivados(s)}`,
          error: "Error al realizar la operación",
        })
        .unwrap()
        .then(() => {
          mutate();
          setUsersList({});
          setDialogOpen(false);
        });
    };
  };

  return (
    <AlertDialog  open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger  render={children} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Desea bloquear a {usersList.length} usuario(s)?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Los usuarios seleccionados no podrán iniciar sesión hasta que sean
            aktivados.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form
          id={`form-alert-dialog-ban-users-${id_component}`}
          onSubmit={form.handleSubmit(handler(usersList))}
        >
          <FieldSet>
            <FieldGroup className="gap-4 w-full">
              <Controller
                name="banExpiresIn"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation="vertical"
                    data-invalid={fieldState.invalid}
                    className="w-full "
                  >
                    <FieldContent>
                      <FieldLabel htmlFor="form-rhf-select-language">
                        Ban Expires In
                      </FieldLabel>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                    <Select
                      items={bannedTimes}
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="form-rhf-select-field"
                        aria-invalid={fieldState.invalid}
                        disabled={isMutating}
                        className="min-w-30 capitalize"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger>
                        <SelectGroup>
                          {bannedTimes.map((item) => (
                            <SelectItem
                              className="capitalize"
                              key={item.value}
                              value={item.value}
                            >
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <Controller
                name="banReason"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation="vertical"
                    data-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Ban Reason</FieldLabel>
                      <FieldDescription>
                        Describe la razon del bloqueo.
                      </FieldDescription>
                    </FieldContent>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        rows={6}
                        className="min-h-24 resize-none"
                        aria-invalid={fieldState.invalid}
                        id={`block-${field.name}-textarea`}
                        placeholder="Write a comment..."
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.value.length}/100 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
        </form>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isMutating}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            type="submit"
            disabled={isMutating || !form.formState.isValid}
            form={`form-alert-dialog-ban-users-${id_component}`}
          >
            Bloquear
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
