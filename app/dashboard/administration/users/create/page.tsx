"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeftIcon, UserPlusIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useAdminCreateUser } from "@/hooks/use-admin-create-user";

const formSchema = z
  .object({
    name: z.string().min(2, "Mínimo 2 caracteres").max(100),
    email: z.email("Email inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe incluir mayúscula")
      .regex(/[0-9]/, "Debe incluir número"),
    confirmPassword: z.string(),
    role: z.enum(["user", "moderator", "admin"]).default("user"),
    sendVerificationEmail: z.boolean().default(true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

const roles = [
  { label: "Usuario", value: "user", description: "Acceso básico" },
  {
    label: "Moderador",
    value: "moderator",
    description: "Puede moderar usuarios",
  },
  { label: "Administrador", value: "admin", description: "Acceso completo" },
];

export default function CreateUserPage() {
  const router = useRouter();
  const { trigger, isMutating } = useAdminCreateUser();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user" as const,
      sendVerificationEmail: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await trigger({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        sendVerificationEmail: data.sendVerificationEmail,
      });

      toast.success("Usuario " + data.name + " creado exitosamente");
      router.push("/dashboard/administration/users");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear usuario",
      );
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon-sm"
          nativeButton={false}
          render={<Link href="/dashboard/administration/users" />}
        >
          <ArrowLeftIcon data-icon="inline-start" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Crear Usuario
          </h1>
          <p className="text-sm text-muted-foreground">
            Agrega un nuevo usuario al sistema
          </p>
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {/* Identidad */}
        <FieldSet>
          <FieldLegend>Identidad</FieldLegend>
          <FieldDescription>
            Datos personales del usuario para identificarse en el sistema.
          </FieldDescription>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Juan Pérez"
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      placeholder="juan@ejemplo.com"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </FieldSet>

        <Separator />

        {/* Credenciales */}
        <FieldSet>
          <FieldLegend>Credenciales</FieldLegend>
          <FieldDescription>
            Define la contraseña de acceso del usuario.
          </FieldDescription>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      Mínimo 8 caracteres, una mayúscula y un número
                    </FieldDescription>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Confirmar Contraseña
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          aria-label={
                            showConfirmPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                        >
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </FieldSet>

        <Separator />

        {/* Acceso y opciones */}
        <FieldSet>
          <FieldLegend>Acceso y opciones</FieldLegend>
          <FieldDescription>
            Nivel de permisos y configuración inicial de la cuenta.
          </FieldDescription>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="role">Rol</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="role"
                      aria-invalid={fieldState.invalid}
                      className="w-full capitalize sm:max-w-sm"
                    >
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger>
                      <SelectGroup>
                        {roles.map((role) => (
                          <SelectItem
                            key={role.value}
                            value={role.value}
                            className="capitalize"
                          >
                            <div className="grid gap-0.5">
                              <span>{role.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {role.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  <FieldDescription>
                    Mínimo 8 caracteres, una mayúscula y un número
                  </FieldDescription>
                </Field>
              )}
            />

            <Controller
              name="sendVerificationEmail"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>
                      Enviar email de verificación
                    </FieldLabel>
                    <FieldDescription>
                      El usuario recibirá un correo para verificar su cuenta
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id={field.name}
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        {/* Acciones */}
        <div className="flex flex-col-reverse gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link href="/dashboard/administration/users">Cancelar</Link>
            }
          />
          <Button
            type="submit"
            disabled={isMutating || !form.formState.isValid}
          >
            {isMutating ? (
              <>
                <Spinner data-icon="inline-start" />
                Creando...
              </>
            ) : (
              <>
                <UserPlusIcon data-icon="inline-start" />
                Crear Usuario
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
