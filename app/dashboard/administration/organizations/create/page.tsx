"use client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckIcon } from "lucide-react";
import { FormCreateOrganizationHeader } from "./form-create-org-header";

import { useFormCreateOrganization } from "./use-form-create-org";
import { FormProvider } from "react-hook-form";
import { FormCreateOrganizationBasic } from "./form-create-org-basic";
import { useAdminCreateOrganization } from "@/hooks/use-admin-create-org";
import z from "zod";
import { formCreateOrganizationBasicSchema } from "./form-create-org.schema";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { trigger } = useAdminCreateOrganization();
  const form = useFormCreateOrganization();
  const { isSubmitting, isValid } = form.formState;

  const handleSubmit = async (
    formData: z.infer<typeof formCreateOrganizationBasicSchema>,
  ) => {
    const promise = trigger({
      name: formData.name,
      slug: formData.slug,
      logo: formData.logo,
    });

    toast.promise(promise, {
      loading: "Creating organization...",
      success: (result) => {
        router.push("/dashboard/administration/organizations");
        return `Organization "${result?.name}" created successfully`;
      },
      error: (err) => {
        console.error(err);
        return err?.message || "An error occurred while creating the organization";
      },
    });

    await promise;
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-6"
        >
          <FormCreateOrganizationHeader />
          <FormCreateOrganizationBasic />

          {/* Form Footer */}
          <div className="flex flex-col-reverse gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckIcon data-icon="inline-start" />
                  Create Organization
                </>
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
