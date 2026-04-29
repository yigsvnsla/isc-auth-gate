"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
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
  FieldDescription,
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
import useSWR from "swr";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  searchValue: z.string().optional(),
  searchField: z.enum(["auto", "email", "name"] as const).optional(),
});

type SearchField = z.infer<typeof formSchema>["searchField"];

const fetcher = async (searchValue: string | undefined, searchField: string | undefined) => {
  // Map "auto" to undefined — admin API expects "email" | "name" | undefined
  const field = searchField === "auto" ? undefined : searchField;
  const result = await authClient.admin.listUsers({
    fetchOptions: { throw: true },
    query: {
      limit: 1,
      offset: 0,
      searchValue,
      searchField: field as "email" | "name" | undefined,
    },
  });
  return { total: result.total ?? 0 };
};

// const spokenLanguages = [
//   { label: "English", value: "en" },
//   { label: "Spanish", value: "es" },
//   { label: "French", value: "fr" },
//   { label: "German", value: "de" },
//   { label: "Italian", value: "it" },
//   { label: "Chinese", value: "zh" },
//   { label: "Japanese", value: "ja" },
// ] as const;

// const userStatuses = [
//   { label: "Active", value: "active" },
//   { label: "Inactive", value: "inactive" },
//   { label: "Pending", value: "pending" },
// ] as const;

export const DataTableHeader = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      searchValue: "",
      searchField: "name",
    },
  });

  // 1. Usamos useWatch para complacer al React Compiler y mejorar performance
  const searchControlValue = useWatch({
    control: form.control,
    name: "searchValue",
  });

  const fieldControlValue = useWatch({
    control: form.control,
    name: "searchField",
  });

  const [debouncedSearch] = useDebounceValue(searchControlValue, 500);

  // 2. SWR condicional: solo busca si hay al menos 3 caracteres
  const shouldFetch = debouncedSearch && debouncedSearch.length >= 3;

  const { data, isLoading } = useSWR<{ total: number }>(
    shouldFetch
      ? ["/admin/users/count", debouncedSearch, fieldControlValue] as const
      : null,
    ([, searchValue, searchField]: readonly [string, string | undefined, SearchField]) =>
      fetcher(searchValue, searchField),
    {
      fallbackData: { total: 0 },
      revalidateOnFocus: false,
    },
  );

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
                  />

                  {/* 3. El Spinner solo se muestra cuando realmente está cargando */}
                  <InputGroupAddon align="inline-end">
                    {isLoading && <Spinner className="size-4" />}
                  </InputGroupAddon>
                </InputGroup>

                {/* Opcional: Mostrar el total de resultados encontrados en tiempo real */}
                <FieldDescription>
                  {!!data?.total && `Found ${data.total} users`}
                </FieldDescription>

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
                    id="form-rhf-select-language"
                    aria-invalid={fieldState.invalid}
                    className="min-w-30"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectSeparator />
                    <SelectItem value={"name"}>name</SelectItem>
                    {/* {spokenLanguages.map((language) => (
                      <SelectItem key={language.value} value={language.value}>
                        {language.label}
                      </SelectItem>
                    ))} */}
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
