"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setPreferences,
  nextStep,
  prevStep,
} from "@/features/wizard/wizardSlice";

const INDUSTRY_OPTIONS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Other",
];

const COMPANY_SIZE_OPTIONS = [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1000+",
];

const REFERRAL_OPTIONS = [
  "Search Engine",
  "Social Media",
  "Friend/Colleague",
  "Blog/Article",
  "Other",
];

export function PreferencesStep() {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(
    (state) => state.wizard.steps.preferences
  );

  const [industry, setIndustry] = useState(preferences.industry);
  const [companySize, setCompanySize] = useState(preferences.companySize);
  const [referralSource, setReferralSource] = useState(
    preferences.referralSource
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!industry) newErrors.industry = "Please select an industry";
    if (!companySize) newErrors.companySize = "Please select a company size";
    if (!referralSource)
      newErrors.referralSource = "Please select how you heard about us";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    dispatch(setPreferences({ industry, companySize, referralSource }));
    dispatch(nextStep());
  }

  function handleBack() {
    dispatch(setPreferences({ industry, companySize, referralSource }));
    dispatch(prevStep());
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="industry">Industry</Label>
        <Select value={industry} onValueChange={(v) => v && setIndustry(v)}>
          <SelectTrigger id="industry" className="w-full" aria-invalid={!!errors.industry}>
            <SelectValue placeholder="Select an industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.industry && (
          <p className="text-sm text-destructive">{errors.industry}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="companySize">Company size</Label>
        <Select value={companySize} onValueChange={(v) => v && setCompanySize(v)}>
          <SelectTrigger id="companySize" className="w-full" aria-invalid={!!errors.companySize}>
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.companySize && (
          <p className="text-sm text-destructive">{errors.companySize}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="referralSource">How did you hear about us?</Label>
        <Select value={referralSource} onValueChange={(v) => v && setReferralSource(v)}>
          <SelectTrigger id="referralSource" className="w-full" aria-invalid={!!errors.referralSource}>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {REFERRAL_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.referralSource && (
          <p className="text-sm text-destructive">{errors.referralSource}</p>
        )}
      </div>

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
