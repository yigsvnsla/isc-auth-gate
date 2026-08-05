import {
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperTitle,
  StepperTrigger,
  StepperPanel,
  StepperContent,
} from "@/components/reui/stepper";

import { FC, useMemo } from "react";

import { AuthClientFormSteps } from "./create-oauth-client-form-steps";

export const CreateOauthClientForm: FC = () => {
  const steps = useMemo(() => AuthClientFormSteps, []);

  return (
    <div className="scroll-fade min-h-0 flex-1 overflow-y-auto pr-1">
      <StepperPanel className="text-sm">
        {steps.map((step, index) => (
          <StepperContent key={index} value={index + 1} className="">
            {step.content}
          </StepperContent>
        ))}
      </StepperPanel>
    </div>
  );
};
