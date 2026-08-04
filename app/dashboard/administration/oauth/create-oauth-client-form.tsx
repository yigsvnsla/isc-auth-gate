import { Badge } from "@/components/reui/badge";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperTitle,
  StepperSeparator,
  StepperTrigger,
  StepperPanel,
  StepperContent,
} from "@/components/reui/stepper";
import { Button } from "@/components/ui/button";
import {
  BookUserIcon,
  CheckIcon,
  CreditCardIcon,
  LoaderCircleIcon,
  LockIcon,
} from "lucide-react";

import { FC, useMemo, useState } from "react";
import { CreateOauthClientFormStep1 } from "./create-oauth-client-form-step-1";

export const CreateOauthClientForm: FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const steps = useMemo(
    () => [
      {
        title: "User Details",
        icon: <BookUserIcon className="size-4" />,
        content: <CreateOauthClientFormStep1 />,
      },
      {
        title: "Payment Info",
        icon: <CreditCardIcon className="size-4" />,
      },
      {
        title: "Auth OTP",
        icon: <LockIcon className="size-4" />,
      },
    ],
    [],
  );

  return (
    <Stepper
      value={currentStep}
      onValueChange={setCurrentStep}
      className="w-full flex flex-col gap-4"
    >
      <StepperNav className="flex gap-4 max-w-md mx-auto">
        {steps.map((step, index) => (
          <StepperItem
            key={index}
            step={index + 1}
            className="relative flex-1 items-start"
          >
            <StepperTrigger className="flex grow flex-col items-start justify-center gap-3.5">
              <StepperIndicator className="bg-border data-[state=active]:bg-primary data-[state=completed]:bg-primary h-1 w-full rounded-full">
                <span className="sr-only">{index + 1}</span>
              </StepperIndicator>
              <StepperTitle className="group-data-[state=inactive]/step:text-muted-foreground text-start font-semibold">
                {step.title}
              </StepperTitle>
            </StepperTrigger>
          </StepperItem>
        ))}
      </StepperNav>

      <StepperPanel className="text-sm">
        {steps.map((step, index) => (
          <StepperContent key={index} value={index + 1} className="">
            {step.content}
          </StepperContent>
        ))}
      </StepperPanel>

      <div className="flex items-center justify-between gap-2.5">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((prev) => prev - 1)}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => setCurrentStep((prev) => prev + 1)}
          disabled={currentStep === steps.length}
        >
          Next
        </Button>
      </div>
    </Stepper>
  );
};
