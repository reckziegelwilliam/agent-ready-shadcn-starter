# State Matrix: Multi-Step Wizard

> Documents every user-facing state across the wizard steps. States marked "Not implemented" are known gaps.

## Steps

### Step 1 -- Personal Info

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Idle** | Step loaded, no interaction | Empty form with first name, last name, email, phone fields | Default render | Done |
| **Validating** | User clicked Next or blurred a field | Inline errors beneath invalid fields | Zod schema + react-hook-form `mode: "onBlur"` | Done |
| **Valid** | All required fields pass validation | No errors, Next button proceeds | Form `isValid` state from react-hook-form | Done |
| **Invalid** | One or more fields fail validation | Red border on invalid fields, error messages shown | Zod validation errors mapped to fields | Done |
| **Navigating Back** | N/A (first step) | Back button hidden or disabled on step 1 | Conditional render based on `currentStep === 1` | Done |
| **Data Restored** | User navigated back from step 2 | Fields populated with previously entered data | Redux state hydrates form via `defaultValues` | Done |

### Step 2 -- Preferences

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Idle** | Step loaded, no interaction | Three select dropdowns with placeholder text | Default render | Done |
| **Validating** | User clicked Next without selecting all options | Error messages beneath unselected dropdowns | Zod `.min(1)` on each field | Done |
| **Valid** | All three selects have values | No errors, Next button proceeds | Form validation passes | Done |
| **Invalid** | One or more selects empty | "Please select an option" beneath empty selects | Zod required validation | Done |
| **Navigating Back** | User clicked Back | Returns to step 1 with preserved data | `prevStep` action, step 1 loads from Redux | Done |
| **Data Restored** | User navigated back from step 3 | Selects show previously chosen values | Redux state hydrates form via `defaultValues` | Done |

### Step 3 -- Plan Selection

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Idle** | Step loaded, no plan selected | Three plan cards with no highlight | Default render, no card has active border | Done |
| **Selected** | User clicked a plan card | Selected card has highlighted border, others dimmed | Redux `plan` state, conditional styling | Done |
| **Validating** | User clicked Next without selecting a plan | Error message: "Please select a plan" | Check `plan !== null` before proceeding | Done |
| **Invalid** | No plan selected on Next click | Error text beneath plan cards | Validation gate in navigation | Done |
| **Navigating Back** | User clicked Back | Returns to step 2 with preserved data | `prevStep` action | Done |
| **Data Restored** | User navigated back from review | Previously selected plan is highlighted | Redux `plan` state applied on render | Done |

### Step 4 -- Review & Submit

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Idle** | Step loaded | Summary of all data, edit buttons per section, submit button | Reads all data from Redux state | Done |
| **Submitting** | Submit button clicked, API in flight | Submit button shows spinner, text "Submitting...", edit buttons disabled | `status === "loading"` in wizardSlice | Done |
| **Submit Success** | API returned 200 | Toast notification: "Onboarding complete!", wizard can reset or redirect | `status === "succeeded"`, sonner toast | Done |
| **Submit Error** | API returned 4xx/5xx | Error banner above submit: "Submission failed. Please try again.", form re-enabled | `status === "failed"`, `state.error` displayed | Done |
| **Network Error** | Fetch failed (no connectivity) | Error banner: "Network error. Please check your connection.", form re-enabled | Caught by thunk rejection, error message check | Done |
| **Editing** | User clicked an edit button | Navigates to the relevant step with data preserved | `goToStep` action dispatched | Done |

## Cross-Step States

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Progress Tracking** | Any step | Step indicator shows current step highlighted, completed steps with checkmarks | `StepIndicator` reads `currentStep` from Redux | Done |
| **Step Transition** | Next/Back clicked | Current step unmounts, next step mounts with correct data | Redux `currentStep` drives conditional render | Done |
| **Data Persistence** | Back navigation | All previously entered data is preserved | Each step saves to Redux before navigating | Done |

## Gap Summary

| Gap | Steps Affected | Priority | Notes |
|-----|---------------|----------|-------|
| Offline detection | Step 4 (submit) | Medium | Currently relies on fetch rejection; no proactive offline check |
| Save draft | All | Low | Users lose progress on page refresh |
| Step skip prevention | All | Done | URL does not expose step; Redux state controls flow |
| Animated transitions | All | Low | Steps swap instantly; could add enter/exit animations |

## AI Agent Observations

When generating this wizard flow, AI agents consistently:
1. Implemented step navigation correctly but forgot to persist data when going back
2. Missed validation gating on the Next button (allowed skipping steps with invalid data)
3. Did not include a progress indicator showing completed vs current vs upcoming steps
4. Omitted edit buttons on the review step, making correction require full back-navigation
5. Forgot to disable the submit button and form during API submission
6. Did not show success or error feedback after submission (no toast, no error banner)
