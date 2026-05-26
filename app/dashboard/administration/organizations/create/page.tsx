"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  ArrowLeftIcon,
  CheckIcon,
  GlobeIcon,
  HashIcon,
  Globe2Icon,
  SettingsIcon,
} from "lucide-react";
import { FormCreateOrganizationHeader } from "./form-create-org-header";

import { useFormCreateOrganization } from "./use-form-create-org";
import { FormProvider } from "react-hook-form";
import { FormCreateOrganizationBasic } from "./form-create-org-basic";
import { useAdminCreateOrganization } from "@/hooks/use-admin-create-org";
import z from "zod";
import { formCreateOrganizationBasicSchema } from "./form-create-org.schema";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const form = useFormCreateOrganization();
  const { trigger } = useAdminCreateOrganization();

  // TODO: Organization Details — Custom fields (extend API schema with metadata)
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [orgSize, setOrgSize] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("");

  // TODO: Settings — Custom fields (extend API schema with metadata)
  const [defaultRole, setDefaultRole] = useState("member");
  const [allowInvitations, setAllowInvitations] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = async (
    form: z.infer<typeof formCreateOrganizationBasicSchema>,
  ) => {
    toast.promise(
      trigger({
        name: form.name,
        slug: form.slug,
        logo: form.logo,
      }),
      {
        loading: "Creating organization...",
        success: (result) => {
          router.push("/dashboard/administration/organizations");
          return `Organization "${result?.name}" created successfully`;
        },

        error: (err) => {
          console.error(err);
          return (
            err?.message || "An error occurred while creating the organization"
          );
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex flex-col gap-6">
            <FormCreateOrganizationHeader />
            <Separator />
            <FormCreateOrganizationBasic />

            {/* Section 2: Organization Details — TODO: Custom fields */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe2Icon className="size-4 text-muted-foreground" />
                  <CardTitle>Organization Details</CardTitle>
                  <Badge
                    variant="secondary"
                    className="ml-auto shrink-0 text-[10px]"
                  >
                    COMING SOON
                  </Badge>
                </div>
                <CardDescription>
                  {/* TODO: Extend the organization schema with additionalFields
                    in lib/auth.ts — organization({ schema: { organization: { additionalFields: { ... } } } })
                    then send these in the metadata field of authClient.organization.create() */}
                  Additional metadata for your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field orientation="responsive">
                    <FieldLabel className="text-muted-foreground @md/field-group:w-44">
                      Description
                    </FieldLabel>
                    <FieldContent>
                      <Textarea
                        placeholder="Describe your organization's mission and purpose"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled
                        maxLength={500}
                      />
                      <FieldDescription className="flex items-center gap-2">
                        {/* TODO: Persist description in organization metadata */}
                        <Badge
                          variant="ghost"
                          className="rounded-full px-1.5 py-0 text-[10px] font-normal text-muted-foreground"
                        >
                          TODO
                        </Badge>
                        Extend API schema to store this field
                      </FieldDescription>
                      <FieldError />
                    </FieldContent>
                  </Field>

                  <Field orientation="responsive">
                    <FieldLabel className="text-muted-foreground @md/field-group:w-44">
                      Industry
                    </FieldLabel>
                    <FieldContent>
                      <Select
                        value={industry}
                        onValueChange={(v) => setIndustry(v ?? "")}
                      >
                        <SelectTrigger className="w-full" disabled>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="manufacturing">
                            Manufacturing
                          </SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription className="flex items-center gap-2">
                        {/* TODO: Persist industry in organization metadata */}
                        <Badge
                          variant="ghost"
                          className="rounded-full px-1.5 py-0 text-[10px] font-normal text-muted-foreground"
                        >
                          TODO
                        </Badge>
                        Extend API schema to store this field
                      </FieldDescription>
                      <FieldError />
                    </FieldContent>
                  </Field>

                  <Field orientation="responsive">
                    <FieldLabel className="text-muted-foreground @md/field-group:w-44">
                      Size
                    </FieldLabel>
                    <FieldContent>
                      <Select
                        value={orgSize}
                        onValueChange={(v) => setOrgSize(v ?? "")}
                      >
                        <SelectTrigger className="w-full" disabled>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1 — 10 employees</SelectItem>
                          <SelectItem value="11-50">
                            11 — 50 employees
                          </SelectItem>
                          <SelectItem value="51-200">
                            51 — 200 employees
                          </SelectItem>
                          <SelectItem value="201-1000">
                            201 — 1,000 employees
                          </SelectItem>
                          <SelectItem value="1000+">
                            1,000+ employees
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription className="flex items-center gap-2">
                        {/* TODO: Persist orgSize in organization metadata */}
                        <Badge
                          variant="ghost"
                          className="rounded-full px-1.5 py-0 text-[10px] font-normal text-muted-foreground"
                        >
                          TODO
                        </Badge>
                        Extend API schema to store this field
                      </FieldDescription>
                      <FieldError />
                    </FieldContent>
                  </Field>

                  <Field orientation="responsive">
                    <FieldLabel className="text-muted-foreground @md/field-group:w-44">
                      Website
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="https://example.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        type="url"
                        disabled
                      />
                      <FieldDescription className="flex items-center gap-2">
                        {/* TODO: Persist website in organization metadata */}
                        <Badge
                          variant="ghost"
                          className="rounded-full px-1.5 py-0 text-[10px] font-normal text-muted-foreground"
                        >
                          TODO
                        </Badge>
                        Extend API schema to store this field
                      </FieldDescription>
                      <FieldError />
                    </FieldContent>
                  </Field>

                  <Field orientation="responsive">
                    <FieldLabel className="text-muted-foreground @md/field-group:w-44">
                      Country
                    </FieldLabel>
                    <FieldContent>
                      <Select
                        value={country}
                        onValueChange={(v) => setCountry(v ?? "")}
                      >
                        <SelectTrigger className="w-full" disabled>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="ec">Ecuador</SelectItem>
                          <SelectItem value="mx">Mexico</SelectItem>
                          <SelectItem value="co">Colombia</SelectItem>
                          <SelectItem value="es">Spain</SelectItem>
                          <SelectItem value="ar">Argentina</SelectItem>
                          <SelectItem value="cl">Chile</SelectItem>
                          <SelectItem value="pe">Peru</SelectItem>
                          <SelectItem value="br">Brazil</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription className="flex items-center gap-2">
                        {/* TODO: Persist country in organization metadata */}
                        <Badge
                          variant="ghost"
                          className="rounded-full px-1.5 py-0 text-[10px] font-normal text-muted-foreground"
                        >
                          TODO
                        </Badge>
                        Extend API schema to store this field
                      </FieldDescription>
                      <FieldError />
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Section 3: Settings — TODO: Custom fields */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <SettingsIcon className="size-4 text-muted-foreground" />
                  <CardTitle>Settings</CardTitle>
                  <Badge
                    variant="secondary"
                    className="ml-auto shrink-0 text-[10px]"
                  >
                    COMING SOON
                  </Badge>
                </div>
                <CardDescription>
                  {/* TODO: Extend the organization schema with additionalFields
                    then include in metadata when creating/updating the organization */}
                  Default behavior and access policies for new members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field orientation="responsive">
                    <FieldLabel className="text-muted-foreground @md/field-group:w-44">
                      Default Member Role
                    </FieldLabel>
                    <FieldContent>
                      <Select
                        value={defaultRole}
                        onValueChange={(v) => setDefaultRole(v ?? "member")}
                      >
                        <SelectTrigger className="w-full" disabled>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* TODO: Persist defaultRole in organization metadata */}
                      <FieldError />
                    </FieldContent>
                  </Field>

                  <Field orientation="responsive">
                    <FieldLabel className="text-muted-foreground @md/field-group:w-44">
                      Allow Invitations
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex h-8 items-center gap-3">
                        <Checkbox
                          checked={allowInvitations}
                          onCheckedChange={(v) =>
                            setAllowInvitations(v === true)
                          }
                          disabled
                        />
                        <span className="text-sm text-muted-foreground">
                          Members can invite others to this organization
                        </span>
                      </div>
                      {/* TODO: Persist allowInvitations in organization metadata */}
                      <FieldError />
                    </FieldContent>
                  </Field>

                  <Field orientation="responsive">
                    <FieldLabel className="text-muted-foreground @md/field-group:w-44">
                      Require Approval
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex h-8 items-center gap-3">
                        <Checkbox
                          checked={requireApproval}
                          onCheckedChange={(v) =>
                            setRequireApproval(v === true)
                          }
                          disabled
                        />
                        <span className="text-sm text-muted-foreground">
                          New members require admin approval to join
                        </span>
                      </div>
                      {/* TODO: Persist requireApproval in organization metadata */}
                      <FieldError />
                    </FieldContent>
                  </Field>

                  <Field orientation="responsive">
                    <FieldLabel className="text-muted-foreground @md/field-group:w-44">
                      Public Organization
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex h-8 items-center gap-3">
                        <Checkbox
                          checked={isPublic}
                          onCheckedChange={(v) => setIsPublic(v === true)}
                          disabled
                        />
                        <span className="text-sm text-muted-foreground">
                          Anyone can find and request to join this organization
                        </span>
                      </div>
                      {/* TODO: Persist isPublic in organization metadata */}
                      <FieldError />
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Form Footer */}
            {/* <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Fields marked{" "}
                <Badge
                  variant="secondary"
                  className="rounded-full px-1.5 py-0 text-[10px]"
                >
                  COMING SOON
                </Badge>{" "}
                will be available once the API schema is extended.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  <ArrowLeftIcon data-icon="inline-start" className="size-4" />
                  Cancel
                </Button>
                <Button type="submit" disabled={!isFormValid || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner className="size-4" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckIcon data-icon="inline-start" className="size-4" />
                      Create Organization
                    </>
                  )}
                </Button>
              </div>
            </div> */}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
