import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, FieldContent } from "@/components/ui/field";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  GlobeIcon,
  HashIcon,
  InfoIcon,
  Link2Icon,
  LinkIcon,
  SearchIcon,
} from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { formCreateOrganizationBasicSchema } from "./form-create-org.schema";
import z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// TODO: Mover esta función a un archivo de utilidades compartidas, ya que es común para generar slugs en toda la aplicación

// * Función para cuando el usuario escribe en 'name' (permite espacios intermedios para luego convertirlos)
const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remueve tildes / diacríticos
    .replace(/[^a-z0-9\s-]/g, "") // Remueve caracteres especiales
    .trim()
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/-+/g, "-");

// * Función estricta en tiempo real para el input 'slug' (no permite espacios ni múltiples guiones al escribir)
const sanitizeSlugInput = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-") // Convierte espacios inmediatamente a guión si intentan presionar la barra espaciadora
    .replace(/[^a-z0-9-]/g, "") // Bloquea cualquier cosa que no sea letra, número o guión
    .replace(/-+/g, "-"); // Colapsa guiones repetidos

export const FormCreateOrganizationBasic = () => {
  // EXTRAEMOS: 'setValue' y 'formState' para validar inteligentemente
  const {
    control,
    setValue,
    formState: { dirtyFields },
  } = useFormContext<z.infer<typeof formCreateOrganizationBasicSchema>>();

  // DESHABILITAMOS el control del formulario para evitar que se valide antes de tiempo, ya que el slug se genera automáticamente a partir del name. Esto previene errores de validación en el slug mientras el usuario está escribiendo el nombre.

  return (
    <>
      {/* Section 1: Basic Information — Better Auth standard fields */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HashIcon className="size-4 text-muted-foreground" />
            <CardTitle>Basic Information</CardTitle>
          </div>
          <CardDescription>
            Core organization details managed by Better Auth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="responsive"
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>
                      Organization Name
                      <Badge
                        variant="default"
                        className="shrink-0 rounded-full px-1.5 py-0 text-[10px] leading-none"
                      >
                        REQUIRED
                      </Badge>
                    </FieldLabel>
                  </FieldContent>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        placeholder="e.g. Integrity Solutions Corp"
                        maxLength={128}
                        required
                        // INTERCEPTOR DE CAMBIOS:
                        onChange={(e) => {
                          // 1. Actualiza el estado de 'name' normalmente
                          field.onChange(e);

                          // 2. Solo auto-generamos el slug si el usuario NO ha modificado el slug manualmente todavía
                          if (!dirtyFields.slug) {
                            setValue("slug", slugify(e.target.value), {
                              shouldValidate: true, // Fuerza a Zod a validar el slug en tiempo real
                              shouldDirty: true, // Marca el formulario como modificado
                            });
                          }
                        }}
                      />
                      <InputGroupAddon align="inline-start">
                        <SearchIcon className="text-muted-foreground" />
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      The display name of your organization
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              name="slug"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="responsive"
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>
                      Slug
                      <Badge
                        variant="default"
                        className="shrink-0 rounded-full px-1.5 py-0 text-[10px] leading-none"
                      >
                        REQUIRED
                      </Badge>
                    </FieldLabel>
                  </FieldContent>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        placeholder="e.g. Integrity Solutions Corp"
                        maxLength={128}
                        required
                        // INTERCEPTOR DEL PROPIO SLUG:
                        onChange={(e) => {
                          // Saneamos el valor que digita el usuario antes de pasarlo al estado
                          const sanitizedValue = sanitizeSlugInput(
                            e.target.value,
                          );

                          // Forzamos manualmente el cambio con el valor limpio
                          field.onChange(sanitizedValue);
                        }}
                      />
                      <InputGroupAddon align="inline-start">
                        <LinkIcon className="text-muted-foreground" />
                      </InputGroupAddon>
                    </InputGroup>
                    {field.value?.trim() && typeof window !== "undefined" && (
                      <Badge
                        variant="outline"
                        className="shrink-0 gap-1 text-xs mt-2 w-max"
                      >
                        <GlobeIcon className="size-3" />
                        {window.location.hostname}/{field.value}
                      </Badge>
                    )}
                    <FieldDescription>
                      URL-friendly identifier. Auto-generated from name.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              name="logo"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="responsive"
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent className="flex-row">
                    <FieldLabel htmlFor={field.name}>Logo URL</FieldLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant={"ghost"}
                              className="rounded-full p-2 hover:bg-accent"
                            >
                              <InfoIcon className="size-4 text-muted-foreground" />
                            </Button>
                          }
                        />
                        <TooltipContent>
                          <p>More information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FieldContent>
                  <FieldContent>
                    <div className="flex items-start gap-3">
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                          placeholder="https://example.com/logo.png"
                          type="url"
                          maxLength={128}
                        />
                        <InputGroupAddon align="inline-start">
                          <Link2Icon className="text-muted-foreground" />
                        </InputGroupAddon>
                      </InputGroup>
                      <Avatar className="mt-0.5 size-8 shrink-0">
                        <AvatarImage src={field.value} />
                        <AvatarFallback className="size-8">CN</AvatarFallback>
                      </Avatar>
                    </div>
                    <FieldDescription>
                      Optional URL for the organization logo image
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>
    </>
  );
};
