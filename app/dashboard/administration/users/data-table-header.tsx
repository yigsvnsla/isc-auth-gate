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
  FieldContent,
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
import { useAdminListUser } from "@/hooks/adminListUsers";

const formSchema = z.object({
  searchValue: z.string().optional(),
  searchField: z.enum(["auto", "email", "name"]).optional(),
});

export const UserListDataTableHeader: FC = () => {
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

  const { isLoading } = useAdminListUser(params);

  return (
    <form onSubmit={form.handleSubmit(console.log)}>
      <FieldSet>
        <FieldGroup className="flex flex-row gap-4 items-start w-full">
          <Controller
            name="searchValue"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="w-full ">
                <FieldLabel htmlFor={field.name}>Search Users</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <SearchIcon className="size-4 text-muted-foreground" />
                  </InputGroupAddon>

                  <InputGroupInput
                    {...field}
                    id={field.name}
                    placeholder="Type to search (min. 3 chars)..."
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    disabled={
                      isLoading && !form.getFieldState("searchValue").isDirty
                    }
                  />

                  {/* 3. El Spinner solo se muestra cuando realmente está cargando */}
                  <InputGroupAddon align="inline-end">
                    {isLoading && form.getFieldState("searchValue").isDirty && (
                      <Spinner className="size-4" />
                    )}
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
              <Field
                data-invalid={fieldState.invalid}
                className="w-full max-w-48"
              >
                <FieldContent>
                  <FieldLabel htmlFor="form-rhf-select-language">
                    Search Field
                  </FieldLabel>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="form-rhf-select-field"
                    aria-invalid={fieldState.invalid}
                    disabled={
                      isLoading && !form.getFieldState("searchValue").isDirty
                    }
                    className="min-w-30 capitalize"
                  >
                    <SelectValue placeholder="Select" />
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
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
    </form>
  );
};
