import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeftIcon, Building2Icon, CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { formCreateOrganizationBasicSchema } from "./form-create-org.schema";
import { useFormContext, useFormState } from "react-hook-form";
import z from "zod";

export const FormCreateOrganizationHeader = () => {
  const router = useRouter();

  const { control } =
    useFormContext<z.infer<typeof formCreateOrganizationBasicSchema>>();
  const { isValid, isSubmitting } = useFormState({ control });

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2Icon className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Create Organization
            </h1>
            <p className="text-sm text-muted-foreground">
              Set up a new organization and configure its initial settings
            </p>
          </div>
        </div>
      </div>
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
        <Button type="submit" disabled={!isValid || isSubmitting}>
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
    </div>
  );
};
