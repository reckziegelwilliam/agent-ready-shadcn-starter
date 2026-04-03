"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setPlan,
  nextStep,
  prevStep,
  type Plan,
} from "@/features/wizard/wizardSlice";

interface PlanOption {
  id: Plan;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const PLANS: PlanOption[] = [
  {
    id: "free",
    name: "Free",
    price: "$0/month",
    description: "Perfect for getting started",
    features: [
      "1 project",
      "1 GB storage",
      "Community support",
      "Basic analytics",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29/month",
    description: "Best for growing teams",
    features: [
      "Unlimited projects",
      "100 GB storage",
      "Priority support",
      "Advanced analytics",
      "Team collaboration",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom pricing",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Unlimited storage",
      "Dedicated account manager",
      "SSO & audit logs",
      "Custom integrations",
    ],
  },
];

export function PlanSelectionStep() {
  const dispatch = useAppDispatch();
  const currentPlan = useAppSelector((state) => state.wizard.steps.plan);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(currentPlan);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(planId: Plan) {
    setSelectedPlan(planId);
    setError(null);
  }

  function handleNext() {
    if (!selectedPlan) {
      setError("Please select a plan");
      return;
    }
    dispatch(setPlan(selectedPlan));
    dispatch(nextStep());
  }

  function handleBack() {
    if (selectedPlan) {
      dispatch(setPlan(selectedPlan));
    }
    dispatch(prevStep());
  }

  return (
    <div className="grid gap-6">
      <div
        className="grid gap-4 sm:grid-cols-3"
        role="radiogroup"
        aria-label="Plan selection"
      >
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <Card
              key={plan.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              className={cn(
                "relative cursor-pointer transition-all hover:shadow-md",
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => handleSelect(plan.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(plan.id);
                }
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {plan.popular && (
                    <Badge variant="secondary">Popular</Badge>
                  )}
                </div>
                <div className="text-2xl font-bold">{plan.price}</div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between pt-6">
        <Button type="button" variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="button" onClick={handleNext}>
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
