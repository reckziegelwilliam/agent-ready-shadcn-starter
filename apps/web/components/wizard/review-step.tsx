"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  goToStep,
  prevStep,
  submitWizard,
  resetWizard,
  type Plan,
} from "@/features/wizard/wizardSlice";

const PLAN_LABELS: Record<Plan, string> = {
  free: "Free -- $0/month",
  pro: "Pro -- $29/month",
  enterprise: "Enterprise -- Custom pricing",
};

export function ReviewStep() {
  const dispatch = useAppDispatch();
  const { steps, status, error } = useAppSelector((state) => state.wizard);
  const { personal, preferences, plan } = steps;
  const isSubmitting = status === "loading";

  async function handleSubmit() {
    if (!plan) return;
    try {
      await dispatch(
        submitWizard({
          personal,
          preferences,
          plan,
        })
      ).unwrap();
      toast.success("Onboarding complete!", {
        description: "Your profile has been set up successfully.",
      });
      dispatch(resetWizard());
    } catch {
      // Error is handled by Redux state
    }
  }

  function handleBack() {
    dispatch(prevStep());
  }

  return (
    <div className="grid gap-6">
      {error && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Personal Information</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => dispatch(goToStep(1))}
            disabled={isSubmitting}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Name</span>
            <span>
              {personal.firstName} {personal.lastName}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Email</span>
            <span>{personal.email}</span>
          </div>
          {personal.phone && (
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">Phone</span>
              <span>{personal.phone}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Preferences</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => dispatch(goToStep(2))}
            disabled={isSubmitting}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Industry</span>
            <span>{preferences.industry}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Company size</span>
            <span>{preferences.companySize}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Referral source</span>
            <span>{preferences.referralSource}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Selected Plan</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => dispatch(goToStep(3))}
            disabled={isSubmitting}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="text-sm">
          {plan ? PLAN_LABELS[plan] : "No plan selected"}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </div>
  );
}
