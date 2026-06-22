"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Controller } from "react-hook-form";
import { ArrowLeftIcon, UserPlusIcon, LoaderCircleIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/sonner";
import { useAdminCreateUser } from "@/hooks/use-admin-create-user";

const formSchema = z
  .object({
    name: z.string().min(2, "Mínimo 2 caracteres").max(100),
    email: z.string().email("Email inválido"),
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
  { label: "Moderador", value: "moderator", description: "Puede moderar usuarios" },
  { label: "Administrador", value: "admin", description: "Acceso completo" },
];

export default function CreateUserPage() {
  const router = useRouter();
  const { trigger, isMutating } = useAdminCreateUser();

  const form = useForm({
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
    } catch (error: any) {
      toast.error(error?.message || "Error al crear usuario");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon-sm" nativeButton={false} render={<Link href="/dashboard/administration/users" />}>
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

      {/* Formulario - Horizontal Enterprise Layout */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-6xl"
      >
        <Card className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/80" />

          <CardHeader>
            <CardTitle className="text-xl">Información del Usuario</CardTitle>
            <CardDescription>
              Completa los datos para crear un nuevo usuario en el sistema.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Two-column horizontal layout */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column */}
              <div className="grid gap-6">
                <Controller
                  name="name"
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
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field orientation="vertical" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <FieldDescription>Correo electrónico de acceso</FieldDescription>
                      <Input
                        {...field}
                        id={field.name}
                        type="email"
                        placeholder="juan@ejemplo.com"
                        aria-invalid={fieldState.invalid}
                        className="h-9"
                      />
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              {/* Right Column */}
              <div className="grid gap-6">
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field orientation="vertical" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
                      <FieldDescription>Mínimo 8 caracteres, una mayúscula y un número</FieldDescription>
                      <Input
                        {...field}
                        id={field.name}
                        type="password"
                        placeholder="••••••••"
                        aria-invalid={fieldState.invalid}
                        className="h-9"
                      />
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field orientation="vertical" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Confirmar Contraseña</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="password"
                        placeholder="••••••••"
                        aria-invalid={fieldState.invalid}
                        className="h-9"
                      />
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </div>

            {/* Rol - Full Width */}
            <div className="mt-6">
              <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field orientation="vertical" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="role">Rol</FieldLabel>
                    <FieldDescription>Nivel de acceso del usuario</FieldDescription>
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="role"
                        aria-invalid={fieldState.invalid}
                        className="h-9 min-w-40 capitalize"
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
                    {fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            {/* Opciones adicionales - Horizontal Enterprise Style */}
            <div className="mt-6 grid gap-4">
              <FieldLabel>Opciones</FieldLabel>

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="sendVerificationEmail"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex items-start gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-muted shrink-0">
                        <MailIcon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="grid gap-1 flex-1 min-w-0">
                        <FieldLabel htmlFor={field.name} className="font-normal">
                          Enviar email de verificación
                        </FieldLabel>
                        <FieldDescription className="text-xs">
                          El usuario recibirá un correo para verificar su cuenta
                        </FieldDescription>
                        <div className="pt-1">
                          <Checkbox
                            id={field.name}
                            checked={field.value}
                            onCheckedChange={(checked) => field.onChange(checked)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                />

                {/* TODO: Implementar cuando SMTP esté configurado */}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-foreground/10 pt-6">
            <Button variant="outline" nativeButton={false} render={<Link href="/dashboard/administration/users">Cancelar</Link>}>
            </Button>
            <Button type="submit" disabled={isMutating || !form.formState.isValid}>
              {isMutating ? (
                <>
                  <LoaderCircleIcon data-icon="inline-start" className="size-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlusIcon data-icon="inline-start" />
                  Crear Usuario
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
