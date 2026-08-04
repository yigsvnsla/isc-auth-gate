import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { CreateOAuthClientData } from "./create-oauth-client-schema";

export const CreateOauthClientFormStep1: FC = () => {
  const form = useFormContext<CreateOAuthClientData>();

  return (
    <FieldSet>
      <FieldLegend>Create OAuth Client</FieldLegend>
      <FieldDescription>
        Register a new OAuth 2.1 client application.
      </FieldDescription>
      <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="client_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="Juan Pérez"
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              <FieldDescription>Nombre completo del usuario</FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="client_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
              <FieldDescription>Nombre completo del usuario</FieldDescription>
              <Input
                {...field}
                id={field.name}
                placeholder="Juan Pérez"
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="client_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
              <FieldDescription>Nombre completo del usuario</FieldDescription>
              <Input
                {...field}
                id={field.name}
                placeholder="Juan Pérez"
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="client_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
              <FieldDescription>Nombre completo del usuario</FieldDescription>
              <Input
                {...field}
                id={field.name}
                placeholder="Juan Pérez"
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="client_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
              <FieldDescription>Nombre completo del usuario</FieldDescription>
              <Input
                {...field}
                id={field.name}
                placeholder="Juan Pérez"
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="client_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
              <FieldDescription>Nombre completo del usuario</FieldDescription>
              <Input
                {...field}
                id={field.name}
                placeholder="Juan Pérez"
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="client_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
              <FieldDescription>Nombre completo del usuario</FieldDescription>
              <Input
                {...field}
                id={field.name}
                placeholder="Juan Pérez"
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="client_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
              <FieldDescription>Nombre completo del usuario</FieldDescription>
              <Input
                {...field}
                id={field.name}
                placeholder="Juan Pérez"
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </FieldSet>
  );
};
