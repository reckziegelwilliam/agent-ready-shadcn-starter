"use client";

import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface WizardNavigationProps {
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
}

export function WizardNavigation({
  currentStep,
  onBack,
  onNext,
  isNextDisabled = false,
}: WizardNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-6">
      {currentStep > 1 ? (
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      ) : (
        <div />
      )}
      {currentStep < 4 && (
        <Button type="button" onClick={onNext} disabled={isNextDisabled}>
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
