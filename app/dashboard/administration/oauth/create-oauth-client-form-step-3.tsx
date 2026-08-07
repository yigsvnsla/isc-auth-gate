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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { CreateOAuthClientData } from "./create-oauth-client-schema";

const authMethods = [
  "none",
  "client_secret_basic",
  "client_secret_post",
] as const;
const clientTypes = ["web", "native", "user-agent-based"] as const;
const subjectTypes = ["public", "pairwise"] as const;
const grantOptions = [
  "authorization_code",
  "client_credentials",
  "refresh_token",
] as const;

const responseOptions = ["code"] as const;

export const CreateOauthClientFormStep3: FC = () => {
  const form = useFormContext<CreateOAuthClientData>();

  return (
    <FieldSet>
      <FieldLegend>Protocolo OAuth2, Autenticación y Seguridad</FieldLegend>
      <FieldDescription>
        Configuración del flujo de autorización, método de autenticación del
        cliente y políticas de seguridad.
      </FieldDescription>
      <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Tipo de cliente</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tipo de cliente</SelectLabel>
                    {clientTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>
                web: servidor con secret · native: app móvil · user-agent: SPA.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="token_endpoint_auth_method"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Método de autenticación
              </FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectValue placeholder="Selecciona un método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>
                      Autenticación en el token endpoint
                    </SelectLabel>
                    {authMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>
                none: cliente público sin secret.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="subject_type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Tipo de subject</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tipo de subject</SelectLabel>
                    {subjectTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>
                public: mismo sub para todos · pairwise: sub por cliente.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="scope"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Scopes</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="openid profile email offline_access"
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              <FieldDescription>
                Scopes por defecto del cliente, separados por espacio.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="grant_types"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel>Grant types</FieldLabel>
              <div className="flex flex-col gap-2">
                {grantOptions.map((grant) => (
                  <label
                    key={grant}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={field.value?.includes(grant) ?? false}
                      onCheckedChange={(checked) => {
                        const current = field.value ?? [];
                        const next = checked
                          ? [...current, grant]
                          : current.filter((g) => g !== grant);
                        field.onChange(next);
                      }}
                    />
                    <span className="font-mono text-xs">{grant}</span>
                  </label>
                ))}
              </div>
              <FieldDescription>
                Flujos que el cliente puede utilizar.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="response_types"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel>Response types</FieldLabel>
              <div className="flex flex-col gap-2">
                {responseOptions.map((response) => (
                  <label
                    key={response}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={field.value?.includes(response) ?? false}
                      onCheckedChange={(checked) => {
                        const current = field.value ?? [];
                        const next = checked
                          ? [...current, response]
                          : current.filter((r) => r !== response);
                        field.onChange(next);
                      }}
                    />
                    <span className="font-mono text-xs">{response}</span>
                  </label>
                ))}
              </div>
              <FieldDescription>
                OAuth 2.1 solo soporta &quot;code&quot;.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="client_secret_expires_at"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="vertical" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Expiración del client secret
              </FieldLabel>
              <Input
                id={field.name}
                type="number"
                placeholder="0 = nunca expira"
                aria-invalid={fieldState.invalid}
                className="h-9"
                value={field.value ?? 0}
                onChange={(event) =>
                  field.onChange(
                    event.target.value === ""
                      ? undefined
                      : Number(event.target.value),
                  )
                }
              />
              <FieldDescription>
                Timestamp unix. 0 significa que no expira.
              </FieldDescription>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="require_pkce"
          control={form.control}
          render={({ field }) => (
            <Field
              orientation="horizontal"
              className="items-start justify-between"
            >
              <FieldLabel htmlFor={field.name}>
                Requerir PKCE
                <FieldDescription>
                  Obligatorio en OAuth 2.1 para clientes públicos.
                </FieldDescription>
              </FieldLabel>
              <Switch
                id={field.name}
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />

        <Controller
          name="skip_consent"
          control={form.control}
          render={({ field }) => (
            <Field
              orientation="horizontal"
              className="items-start justify-between"
            >
              <FieldLabel htmlFor={field.name}>
                Omitir consentimiento
                <FieldDescription>
                  Cliente de confianza: el usuario no ve la pantalla de
                  consentimiento.
                </FieldDescription>
              </FieldLabel>
              <Switch
                id={field.name}
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />

        <Controller
          name="enable_end_session"
          control={form.control}
          render={({ field }) => (
            <Field
              orientation="horizontal"
              className="items-start justify-between"
            >
              <FieldLabel htmlFor={field.name}>
                Habilitar end session
                <FieldDescription>
                  Permite RP-initiated logout vía id_token.
                </FieldDescription>
              </FieldLabel>
              <Switch
                id={field.name}
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
      </FieldGroup>
    </FieldSet>
  );
};
