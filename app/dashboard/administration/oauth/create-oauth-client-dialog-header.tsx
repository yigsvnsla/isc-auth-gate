import { FC, useMemo } from "react";
import { AuthClientFormSteps } from "./create-oauth-client-form-steps";
import {
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper";
import { DialogHeader } from "@/components/ui/dialog";

export const CreateOauthClientDialogHeader: FC = () => {
  const steps = useMemo(() => AuthClientFormSteps, []);

  return (
    <DialogHeader>
      <StepperNav className="mx-auto flex max-w-md gap-4">
        {steps.map((step, index) => (
          <StepperItem
            key={index}
            step={index + 1}
            className="relative flex-1 items-start"
            disabled={true}
          >
            <StepperTrigger className="flex grow flex-col items-start justify-center gap-3.5">
              <StepperIndicator className="bg-border data-[state=active]:bg-primary data-[state=completed]:bg-primary h-1 w-full rounded-full">
                <span className="sr-only">{index + 1}</span>
              </StepperIndicator>
              <StepperTitle className="group-data-[state=inactive]/step:text-muted-foreground flex items-center gap-1.5 text-start font-semibold">
                {step.icon}
                {step.title}
              </StepperTitle>
            </StepperTrigger>
          </StepperItem>
        ))}
      </StepperNav>
    </DialogHeader>
  );
};
