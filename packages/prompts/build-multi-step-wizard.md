# Build Multi-Step Wizard

> Target spec: `packages/specs/multi-step-wizard.md`
> Difficulty: Medium

## Context

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **State management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Forms:** `react-hook-form` v7 with `@hookform/resolvers` and `zod` v3
- **UI components:** Imported from `@workspace/ui/components/` (shadcn/ui primitives). Available: button, input, label, card, tabs, badge, separator, skeleton, checkbox, select, dialog, dropdown-menu, sonner
- **Utility:** `cn()` from `@workspace/ui/lib/utils`
- **Icons:** `lucide-react`
- **Routing:** Next.js App Router file-based routing
- **Feature directory:** `apps/web/features/wizard/` for wizard-related state
- **Components directory:** `apps/web/components/wizard/` for wizard UI components

## Input

1. Read the full spec: `packages/specs/multi-step-wizard.md`
2. Read the state matrix: `packages/specs/multi-step-wizard-states.md`
3. Review existing patterns: `apps/web/features/auth/authSlice.ts` and `apps/web/components/auth/login-form.tsx`
4. Check the Redux store: `apps/web/lib/store/store.ts` (you need to add your reducer here alongside existing ones)
5. Check available UI components in `@workspace/ui/components/`

## Instructions

### 1. Build the Redux Slice

Create the wizard state slice with step management and async submission.

- File: `apps/web/features/wizard/wizardSlice.ts`
- Initial state: `{ currentStep: 1, steps: { personal: {...}, preferences: {...}, plan: null }, status: "idle", error: null }`
- Sync actions: `setPersonalInfo`, `setPreferences`, `setPlan`, `nextStep`, `prevStep`, `goToStep`, `resetWizard`, `clearWizardError`
- Async thunk: `submitWizard` -- POST to `/onboarding/submit` with all wizard data
- Each thunk case: `pending` sets `loading` and clears `error`, `fulfilled` sets `succeeded`, `rejected` sets `failed` and stores error message
- Export `initialState` for use in tests

### 2. Register the Slice

Add the wizard reducer to the Redux store.

- File: `apps/web/lib/store/store.ts`
- Import `wizardReducer` from `@/features/wizard/wizardSlice`
- Add it under the `wizard` key alongside existing reducers (auth, settings, etc.)
- **IMPORTANT:** Read the file first. Do not overwrite existing reducers.

### 3. Build the NestJS API

Create the onboarding API endpoint.

- Directory: `apps/api/src/onboarding/`
- Files: `onboarding.module.ts`, `onboarding.controller.ts`, `onboarding.service.ts`
- Controller: `POST /onboarding/submit` accepts the full wizard payload
- Service: Validates required fields, adds a 1-second delay, returns `{ message, onboardingId }`
- Register `OnboardingModule` in `apps/api/src/app.module.ts`

### 4. Build the Step Indicator

Create a progress indicator showing 4 steps.

- File: `apps/web/components/wizard/step-indicator.tsx`
- "use client" directive required
- Shows 4 numbered circles connected by lines
- Completed steps show a checkmark icon, current step is highlighted, future steps are dimmed
- Uses `currentStep` from Redux to determine state
- Accessible: uses `aria-current="step"` on the active step

### 5. Build Step 1 -- Personal Info

- File: `apps/web/components/wizard/personal-info-step.tsx`
- "use client" directive required
- Uses `react-hook-form` with `zodResolver`
- Fields: firstName, lastName (side by side), email, phone (optional)
- On valid submit: dispatches `setPersonalInfo` then `nextStep`
- Loads `defaultValues` from Redux state so data persists on back-navigation
- Next button submits the form (validation gates navigation)

### 6. Build Step 2 -- Preferences

- File: `apps/web/components/wizard/preferences-step.tsx`
- "use client" directive required
- Three shadcn Select components: industry, companySize, referralSource
- Local state for select values, initialized from Redux
- Manual validation on Next click (all three required)
- Back button saves current selections to Redux before navigating back
- **IMPORTANT:** The Select component uses `value` and `onValueChange` props (base-ui pattern)

### 7. Build Step 3 -- Plan Selection

- File: `apps/web/components/wizard/plan-selection-step.tsx`
- "use client" directive required
- Three Card components with plan details (Free/Pro/Enterprise)
- Clicking a card selects it (highlighted border via `ring-2 ring-primary/20`)
- Cards use `role="radio"` and `aria-checked` for accessibility
- Cards are keyboard-navigable (Enter/Space to select)
- Validation on Next: must have a plan selected
- Back saves current selection before navigating

### 8. Build Step 4 -- Review & Submit

- File: `apps/web/components/wizard/review-step.tsx`
- "use client" directive required
- Three Card sections showing personal info, preferences, and plan
- Each section has an Edit button that dispatches `goToStep(n)`
- Submit button dispatches `submitWizard` thunk
- Loading state: spinner on button, "Submitting..." text, edit buttons disabled
- Success: toast via `sonner` ("Onboarding complete!"), then `resetWizard`
- Error: alert banner above submit button showing error message
- Uses `.unwrap()` on the thunk dispatch for proper error handling

### 9. Build the Wizard Layout

- File: `apps/web/components/wizard/wizard-layout.tsx`
- "use client" directive required
- Renders `StepIndicator` at the top
- Renders a Card with title/description that changes per step
- Conditionally renders the correct step component based on `currentStep`

### 10. Create the Page

- File: `apps/web/app/wizard/page.tsx`
- Server component (no "use client")
- Renders `WizardLayout`
- Exports metadata with title "Onboarding Wizard"

## Output

| File | Action | Description |
|------|--------|-------------|
| `apps/web/features/wizard/wizardSlice.ts` | Create | Redux slice with step actions and submit thunk |
| `apps/web/lib/store/store.ts` | Modify | Add wizard reducer alongside existing reducers |
| `apps/api/src/onboarding/onboarding.module.ts` | Create | NestJS module |
| `apps/api/src/onboarding/onboarding.controller.ts` | Create | POST /onboarding/submit controller |
| `apps/api/src/onboarding/onboarding.service.ts` | Create | Onboarding service with validation |
| `apps/api/src/app.module.ts` | Modify | Register OnboardingModule |
| `apps/web/components/wizard/step-indicator.tsx` | Create | Progress indicator |
| `apps/web/components/wizard/personal-info-step.tsx` | Create | Step 1 form |
| `apps/web/components/wizard/preferences-step.tsx` | Create | Step 2 selects |
| `apps/web/components/wizard/plan-selection-step.tsx` | Create | Step 3 plan cards |
| `apps/web/components/wizard/review-step.tsx` | Create | Step 4 review and submit |
| `apps/web/components/wizard/wizard-layout.tsx` | Create | Wizard container |
| `apps/web/app/wizard/page.tsx` | Create | Next.js page |

## Constraints

- Button does NOT have `asChild` -- use `buttonVariants` with Link, or use Button directly
- All step components need "use client" directive
- Use `sonner` for toast notifications (import `toast` from `sonner`)
- Import shadcn components from `@workspace/ui/components/{name}`
- Import `cn` from `@workspace/ui/lib/utils`
- The Select component is based on base-ui, not radix. It uses `value`/`onValueChange` on the root `Select` component.

## Verification

1. **Type check:** `pnpm typecheck` passes with zero errors.
2. **Lint:** `pnpm lint` passes with zero errors.
3. **Tests:** `pnpm --filter web test` -- all wizard slice tests pass.
4. **Visual -- Step 1:** Navigate to `/wizard`. Verify empty form. Submit empty and see validation errors. Fill in valid data, click Next.
5. **Visual -- Step 2:** Verify three select dropdowns. Click Next without selecting all and see errors. Select all, click Next.
6. **Visual -- Step 3:** Verify three plan cards. Click Next without selecting and see error. Select a plan, verify highlight, click Next.
7. **Visual -- Step 4:** Verify summary shows all entered data. Click Edit buttons and verify navigation to correct step. Submit and verify toast.
8. **Back navigation:** From step 3, click Back twice to step 1. Verify all data is preserved.
9. **Accessibility:** Tab through all steps. Verify labels, error announcements, plan card keyboard selection.
10. **Responsive:** Resize from 320px to 1440px. Verify layout adapts.
11. **Spec coverage:** Walk through every acceptance criterion in the spec.
