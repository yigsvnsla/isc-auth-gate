"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon } from "lucide-react";
import * as z from "zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { FC, useEffect } from "react";
import { paramListUsersAtom } from "@/atoms/params-list-users-atom";
import { useAtom } from "jotai";
import { useAdminListUser } from "@/hooks/use-admin-list-users";

const formSchema = z.object({
  searchValue: z.string().optional(),
  searchField: z.enum(["auto", "email", "name"]).optional(),
});

export const UserListDataTableHeader: FC = () => {
  // TODO: Entiendo perfectamente que la sincrizacion de estados en el efecto no es lo mejor pero para empezar esta bien, deberia refactorizarse para no depender de una sincronizacion asincrona

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onTouched",
    resolver: zodResolver(formSchema),

    defaultValues: {
      searchValue: "",
      searchField: "name",
    },
  });

  const searchControlValue = useWatch({
    control: form.control,
    name: "searchValue",
  });

  const fieldControlValue = useWatch({
    control: form.control,
    name: "searchField",
  });

  const [params, setParams] = useAtom(paramListUsersAtom);

  const [debouncedSearch] = useDebounceValue(searchControlValue, 500);

  useEffect(() => {
    setParams((currentParams) => ({
      ...currentParams,
      searchField: fieldControlValue ?? "",
      searchValue: debouncedSearch ?? "",
      pageIndex: 0,
    }));
  }, [debouncedSearch, fieldControlValue, setParams]);

  // TODO: Refactorizar este componente para deshabilitar el formulario directamente desde el hook y no desde el template
  const { isLoading, isValidating } = useAdminListUser(params);

  return (
    <form onSubmit={form.handleSubmit(console.log)}>
      <FieldSet>
        <FieldGroup className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Controller
            name="searchValue"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor={field.name}>Buscar usuarios</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <SearchIcon className="size-4 text-muted-foreground" />
                  </InputGroupAddon>

                  <InputGroupInput
                    {...field}
                    id={field.name}
                    placeholder="Escribe para buscar (mín. 3 caracteres)..."
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    disabled={
                      isLoading ||
                      (isValidating &&
                        !form.getFieldState("searchValue").isDirty)
                    }
                  />

                  <InputGroupAddon align="inline-end">
                    {isLoading ||
                      (isValidating &&
                        form.getFieldState("searchValue").isDirty && (
                          <Spinner className="size-4" />
                        ))}
                  </InputGroupAddon>
                </InputGroup>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="searchField"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="sm:w-48">
                <FieldLabel htmlFor="form-rhf-select-field">
                  Campo de búsqueda
                </FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="form-rhf-select-field"
                    aria-invalid={fieldState.invalid}
                    disabled={
                      isLoading ||
                      (isValidating &&
                        !form.getFieldState("searchValue").isDirty)
                    }
                    className="w-full capitalize sm:w-48"
                  >
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger>
                    {["auto", "name", "email"].map((field) => (
                      <SelectItem
                        className="capitalize"
                        key={field}
                        value={field}
                      >
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
    </form>
  );
};
