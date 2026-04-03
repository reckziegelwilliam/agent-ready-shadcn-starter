import type { ComparisonExample } from "./types";

export const multiStepWizardComparison: ComparisonExample = {
  slug: "multi-step-wizard",
  title: "Multi-step Wizard",
  description:
    "Onboarding wizard with step navigation, validation gating, and review step. AI output lost data on back navigation, had no progress indicator, no edit buttons on review, and no submit loading state. The production version fixes all six issues found in review.",
  issueCount: 6,
  files: [
    {
      filename: "wizard-layout.tsx",
      aiGenerated: `export function WizardLayout() {
  const currentStep = useAppSelector((state) => state.wizard.currentStep);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Personal Information"}
            {currentStep === 2 && "Preferences"}
            {currentStep === 3 && "Select a Plan"}
            {currentStep === 4 && "Review & Submit"}
          </CardTitle>
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
}`,
      production: `const STEP_META = [
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
}`,
      aiAnnotations: [
        {
          lineStart: 1,
          lineEnd: 5,
          type: "fix",
          title: "No progress indicator",
          description:
            "The wizard has no visual indicator of the current step or total steps. Users have no context for how far they are in the flow or how many steps remain.",
        },
        {
          lineStart: 7,
          lineEnd: 12,
          type: "improvement",
          title: "Inline title strings instead of metadata array",
          description:
            "Step titles are hardcoded inline with && chains. The production version extracts a STEP_META array with titles and descriptions, making it easier to maintain and enabling the CardDescription subtitle.",
        },
      ],
      prodAnnotations: [
        {
          lineStart: 17,
          lineEnd: 17,
          type: "fix",
          title: "StepIndicator renders progress",
          description:
            "A dedicated StepIndicator component shows numbered circles with connecting lines. Completed steps show checkmarks and the current step is highlighted, giving users orientation within the wizard.",
        },
        {
          lineStart: 1,
          lineEnd: 6,
          type: "improvement",
          title: "Step metadata extracted to array",
          description:
            "Titles and descriptions are stored in a STEP_META array. This centralizes step information and enables CardDescription subtitles that give users context about each step.",
        },
      ],
    },
    {
      filename: "review-step.tsx",
      aiGenerated: `export function ReviewStep() {
  const dispatch = useAppDispatch();
  const { steps, status, error } = useAppSelector((state) => state.wizard);
  const { personal, preferences, plan } = steps;

  async function handleSubmit() {
    if (!plan) return;
    dispatch(submitWizard({ personal, preferences, plan }));
  }

  function handleBack() {
    dispatch(prevStep());
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Name</span>
            <span>{personal.firstName} {personal.lastName}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Email</span>
            <span>{personal.email}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selected Plan</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {plan ? PLAN_LABELS[plan] : "No plan selected"}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </div>
  );
}`,
      production: `export function ReviewStep() {
  const dispatch = useAppDispatch();
  const { steps, status, error } = useAppSelector((state) => state.wizard);
  const { personal, preferences, plan } = steps;
  const isSubmitting = status === "loading";

  async function handleSubmit() {
    if (!plan) return;
    try {
      await dispatch(
        submitWizard({ personal, preferences, plan })
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
        <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Personal Information</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => dispatch(goToStep(1))} disabled={isSubmitting}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Name</span>
            <span>{personal.firstName} {personal.lastName}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Email</span>
            <span>{personal.email}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Preferences</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => dispatch(goToStep(2))} disabled={isSubmitting}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Selected Plan</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => dispatch(goToStep(3))} disabled={isSubmitting}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="text-sm">
          {plan ? PLAN_LABELS[plan] : "No plan selected"}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" aria-hidden="true" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
}`,
      aiAnnotations: [
        {
          lineStart: 17,
          lineEnd: 20,
          type: "fix",
          title: "No edit buttons to jump to previous steps",
          description:
            "Each review section shows data as read-only with no way to jump back to a specific step. Users must click Back three times to correct step 1 data.",
        },
        {
          lineStart: 61,
          lineEnd: 63,
          type: "fix",
          title: "Submit button never disables during submission",
          description:
            "The submit button has no loading state. Clicking it multiple times sends duplicate API requests. There is no spinner or disabled state during the async operation.",
        },
        {
          lineStart: 6,
          lineEnd: 8,
          type: "fix",
          title: "No success/error feedback after submit",
          description:
            "The dispatch call does not await or handle the promise. On success, nothing visible happens. On error, the Redux error state is set but never rendered.",
        },
      ],
      prodAnnotations: [
        {
          lineStart: 37,
          lineEnd: 41,
          type: "fix",
          title: "Per-section edit buttons with goToStep",
          description:
            "Each Card section has an Edit button that dispatches goToStep(n) to jump directly to the relevant wizard step. Buttons are disabled during submission to prevent navigation while the API call is in flight.",
        },
        {
          lineStart: 89,
          lineEnd: 101,
          type: "fix",
          title: "Submit disables with spinner during API call",
          description:
            "isSubmitting is derived from status === 'loading'. The submit button shows a spinner SVG with 'Submitting...' text and is disabled. Back and edit buttons are also disabled to prevent navigation during submission.",
        },
        {
          lineStart: 7,
          lineEnd: 20,
          type: "fix",
          title: "Awaited dispatch with success toast and error handling",
          description:
            "The dispatch is awaited with .unwrap(). On success, a sonner toast confirms completion and the wizard resets. On error, the catch block lets Redux state handle the error, which is rendered as a role='alert' banner.",
        },
      ],
    },
  ],
};
