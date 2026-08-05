import { Button } from "@/components/ui/button";
import { useStepper } from "@/components/reui/stepper";
import { useFormContext } from "react-hook-form";
import { FC, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { CreateOAuthClientData } from "./create-oauth-client-schema";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { AuthClientFormSteps } from "./create-oauth-client-form-steps";
import { useCreateOauthClientMutation } from "./create-oauth-client-mutation";

const stepFields: Array<Array<keyof CreateOAuthClientData>> = [
  [
    "client_name",
    "client_uri",
    "logo_uri",
    "contacts",
    "tos_uri",
    "policy_uri",
    "software_id",
    "software_version",
    "software_statement",
    "metadata",
  ],
  ["redirect_uris", "post_logout_redirect_uris"],
  [
    "scope",
    "token_endpoint_auth_method",
    "grant_types",
    "response_types",
    "type",
    "client_secret_expires_at",
    "skip_consent",
    "enable_end_session",
    "require_pkce",
    "subject_type",
  ],
] as Array<Array<keyof CreateOAuthClientData>>;

export const CreateOauthClientDialogFooter: FC = () => {
  const createMutation = useCreateOauthClientMutation();

  const form = useFormContext<CreateOAuthClientData>();

  const steps = useMemo(() => AuthClientFormSteps, []);

  const { activeStep, setActiveStep } = useStepper();

  const totalSteps = steps.length;
  const isLastStep = activeStep === totalSteps;
  const isValid = form.formState.isValid;

  async function handleNext() {
    const isValid = await form.trigger(stepFields[activeStep - 1]);
    if (isValid) {
      setActiveStep(activeStep + 1);
    }
  }

  const cancelHandler = () => {
    form.reset();
    setActiveStep(1);
  };

  const submitHandler = async () => {
    //   try {
    //     const client = await createMutation.trigger(value);
    //     toast.success(`Cliente "${client.clientId}" creado`);
    //     form.reset();
    //     setOpen(false);
    //   } catch (error) {
    //     toast.error(
    //       error instanceof Error ? error.message : "No se pudo crear el cliente",
    //     );
    //   }};
  };

  return (
    <DialogFooter className="sm:justify-between">
      <DialogClose
        render={
          <Button onClick={cancelHandler} variant="outline">
            Cancel
          </Button>
        }
      />

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setActiveStep(activeStep - 1)}
          disabled={activeStep === 1}
        >
          <ChevronLeftIcon data-icon="inline-start" />
          Anterior
        </Button>
        {isLastStep ? (
          <Button
            onClick={submitHandler}
            disabled={!isValid || createMutation.isMutating}
          >
            {createMutation.isMutating ? "Creating..." : "Create Client"}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Siguiente
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        )}
      </div>
    </DialogFooter>
  );
};
