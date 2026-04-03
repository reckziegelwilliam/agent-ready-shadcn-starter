# Multi-Step Wizard Example

> Status: Complete

## Overview

A 4-step onboarding wizard demonstrating complex multi-step form management with Redux Toolkit, per-step validation with Zod, and data persistence across navigation.

**Steps:**
1. **Personal Info** -- Text inputs with Zod validation (first name, last name, email, optional phone)
2. **Preferences** -- Three select dropdowns (industry, company size, referral source)
3. **Plan Selection** -- Three plan cards with radio-style selection (Free/Pro/Enterprise)
4. **Review & Submit** -- Read-only summary with edit buttons per section and API submission

## Key Patterns Demonstrated

- Step-by-step navigation with a visual progress indicator (numbered circles with checkmarks)
- Per-step validation that gates navigation -- Next button only proceeds if the current step is valid
- Data persistence in Redux so users can navigate back without losing input
- Review step with edit buttons that jump directly to the relevant step via `goToStep`
- Single API submission from the review step with loading, success (toast), and error (banner) states
- Accessible plan cards using `role="radio"` and `aria-checked`

## File Map

| File | Purpose |
|------|---------|
| `packages/specs/multi-step-wizard.md` | Feature specification |
| `packages/specs/multi-step-wizard-states.md` | State matrix for all steps |
| `apps/api/src/onboarding/` | NestJS API module (POST /onboarding/submit) |
| `apps/web/features/wizard/wizardSlice.ts` | Redux slice with step actions and submit thunk |
| `apps/web/components/wizard/wizard-layout.tsx` | Main layout with step indicator and step routing |
| `apps/web/components/wizard/step-indicator.tsx` | Progress indicator component |
| `apps/web/components/wizard/personal-info-step.tsx` | Step 1: personal info form |
| `apps/web/components/wizard/preferences-step.tsx` | Step 2: preferences selects |
| `apps/web/components/wizard/plan-selection-step.tsx` | Step 3: plan card selection |
| `apps/web/components/wizard/review-step.tsx` | Step 4: review summary and submit |
| `apps/web/app/wizard/page.tsx` | Next.js page route |
| `apps/web/features/wizard/__tests__/wizardSlice.test.ts` | Redux slice unit tests |

## Running

```bash
# Start the API (port 4000)
pnpm --filter api dev

# Start the web app
pnpm --filter web dev

# Navigate to /wizard
```

## Testing

```bash
pnpm --filter web test
```

## Related Files

- Spec: `packages/specs/multi-step-wizard.md`
- State matrix: `packages/specs/multi-step-wizard-states.md`
- Prompt: `packages/prompts/build-multi-step-wizard.md`
- Review: `examples/multi-step-wizard/review.md`
