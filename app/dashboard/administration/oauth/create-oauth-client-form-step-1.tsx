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
import { Textarea } from "@/components/ui/textarea";
import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { CreateOAuthClientData } from "./create-oauth-client-schema";

export const CreateOauthClientFormStep1: FC = () => {
  const form = useFormContext<CreateOAuthClientData>();

  return (
    <FieldSet>
      <FieldLegend>Información General y Metadatos</FieldLegend>
      <FieldDescription>
        Metadatos públicos del cliente registrados según RFC 7591. La URI del
        cliente y el logo se muestran en la pantalla de consentimiento.
      </FieldDescription>
      <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="client_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nombre del cliente</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="Mi aplicación"
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              <FieldDescription>
                Nombre mostrado al usuario durante la autorización.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="client_uri"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>URL del cliente</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="url"
                placeholder="https://miapp.com"
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              <FieldDescription>
                Página principal de la aplicación (HTTPS).
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="logo_uri"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>URL del logo</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="url"
                placeholder="https://miapp.com/logo.png"
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              <FieldDescription>
                Logo mostrado en la pantalla de consentimiento.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="software_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Software ID</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="com.miapp.oauth"
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              <FieldDescription>
                Identificador estable del software (recomendado UUID).
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="software_version"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Versión del software</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="1.0.0"
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              <FieldDescription>
                Versión del software del cliente.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="tos_uri"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>URL de Términos</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="url"
                placeholder="https://miapp.com/terms"
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              <FieldDescription>
                Términos de servicio de la aplicación.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="policy_uri"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>URL de Política</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="url"
                placeholder="https://miapp.com/privacy"
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              <FieldDescription>
                Política de privacidad de la aplicación.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="contacts"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Contactos</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="email"
                placeholder="soporte@miapp.com"
                aria-invalid={fieldState.invalid}
                className="h-9"
                value={field.value?.join(", ") ?? ""}
                onChange={(event) => {
                  const raw = event.target.value;
                  const emails = raw
                    .split(",")
                    .map((email) => email.trim())
                    .filter(Boolean);
                  field.onChange(emails.length ? emails : undefined);
                }}
              />
              <FieldDescription>
                Correos de contacto separados por comas.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="software_statement"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Declaración de software
              </FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                placeholder="JWT que certifica el software (software_statement)"
                aria-invalid={fieldState.invalid}
                className="min-h-20"
              />
              <FieldDescription>
                Declaración firmada del software del cliente.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="metadata"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Metadatos privados (JSON)
              </FieldLabel>
              <Textarea
                id={field.name}
                placeholder='{"equipo": "mobile", "env": "prod"}'
                aria-invalid={fieldState.invalid}
                className="min-h-20 font-mono text-xs"
                value={field.value ? JSON.stringify(field.value, null, 2) : ""}
                onChange={(event) => {
                  const raw = event.target.value.trim();
                  if (!raw) {
                    field.onChange(undefined);
                    return;
                  }
                  try {
                    field.onChange(JSON.parse(raw));
                  } catch {
                    field.onChange(undefined);
                  }
                }}
              />
              <FieldDescription>
                Metadatos privados solo visibles para el servidor.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </FieldSet>
  );
};
