"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useAppSelector } from "@/lib/store/hooks";
import { StepIndicator } from "./step-indicator";
import { PersonalInfoStep } from "./personal-info-step";
import { PreferencesStep } from "./preferences-step";
import { PlanSelectionStep } from "./plan-selection-step";
import { ReviewStep } from "./review-step";

const STEP_META = [
  { title: "Personal Information", description: "Tell us about yourself" },
  { title: "Preferences", description: "Help us customize your experience" },
  { title: "Select a Plan", description: "Choose the plan that fits your needs" },
  { title: "Review & Submit", description: "Confirm your details and submit" },
];

export function WizardLayout() {
  const currentStep = useAppSelector((state) => state.wizard.currentStep);
  const meta = STEP_META[currentStep - 1];
  const title = meta?.title ?? "Step";
  const description = meta?.description ?? "";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <StepIndicator currentStep={currentStep} />

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && <PersonalInfoStep />}
          {currentStep === 2 && <PreferencesStep />}
          {currentStep === 3 && <PlanSelectionStep />}
          {currentStep === 4 && <ReviewStep />}
        </CardContent>
      </Card>
    </div>
  );
}
