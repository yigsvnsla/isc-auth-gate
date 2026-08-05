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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { FC, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { CreateOAuthClientData } from "./create-oauth-client-schema";

interface UriListFieldProps {
  name: "redirect_uris" | "post_logout_redirect_uris";
  label: string;
  description: string;
  placeholder: string;
  required?: boolean;
}

const UriListField: FC<UriListFieldProps> = ({
  name,
  label,
  description,
  placeholder,
  required,
}) => {
  const form = useFormContext<CreateOAuthClientData>();
  const [draft, setDraft] = useState("");

  const addUri = (uris: string[] | undefined, onChange: (v: string[] | undefined) => void) => {
    const value = draft.trim();
    if (!value) return;
    const next = [...(uris ?? []), value];
    onChange(next);
    setDraft("");
  };

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field orientation="vertical" data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`${name}-input`}>
            {label} {required && <span className="text-destructive">*</span>}
          </FieldLabel>
          <div className="flex gap-2">
            <Input
              id={`${name}-input`}
              type="url"
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
              className="h-9"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addUri(field.value, field.onChange);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => addUri(field.value, field.onChange)}
            >
              Agregar
            </Button>
          </div>
          {field.value && field.value.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {field.value.map((uri, index) => (
                <Badge
                  key={`${uri}-${index}`}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  <span className="max-w-52 truncate font-mono text-xs">
                    {uri}
                  </span>
                  <button
                    type="button"
                    aria-label={`Quitar ${uri}`}
                    className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                    onClick={() => {
                      const next = field.value!.filter((_, i) => i !== index);
                      field.onChange(next.length ? next : undefined);
                    }}
                  >
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <FieldDescription>{description}</FieldDescription>
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export const CreateOauthClientFormStep2: FC = () => {
  return (
    <FieldSet>
      <FieldLegend>URIs de Redirección</FieldLegend>
      <FieldDescription>
        Las URIs registradas son los únicos destinos permitidos al redirigir
        después de la autorización. Agrega cada URI con Enter o el botón.
      </FieldDescription>
      <FieldGroup className="flex flex-col gap-6">
        <UriListField
          name="redirect_uris"
          label="Redirect URIs"
          description="Destinos de callback tras la autorización (obligatorio)."
          placeholder="https://miapp.com/callback"
          required
        />
        <UriListField
          name="post_logout_redirect_uris"
          label="Post-Logout Redirect URIs"
          description="Destinos permitidos tras cerrar sesión (opcional)."
          placeholder="https://miapp.com/logout"
        />
      </FieldGroup>
    </FieldSet>
  );
};
