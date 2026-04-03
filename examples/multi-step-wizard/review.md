# Multi-Step Wizard -- Post-Implementation Review

This document captures lessons from building the multi-step wizard with an AI agent, including common mistakes and how they were corrected.

## What the AI Got Right

**Step navigation structure.** The agent correctly set up Redux actions for `nextStep`, `prevStep`, and `goToStep`, and wired them to Button clicks. The basic forward/back flow worked on the first pass.

**Zod schema accuracy.** Validation rules from the spec were translated into `zod` schemas correctly, including the optional phone field with conditional digit-count validation using `.refine()`.

**Redux slice structure.** The async thunk pattern (pending/fulfilled/rejected) was implemented correctly following the established auth flow pattern. State shape matched the spec.

**Plan card layout.** The three-card layout with radio-style selection was well-structured, using accessible `role="radio"` and `aria-checked` attributes.

## Common Mistakes Caught

### 1. No Data Persistence When Navigating Back

**Issue:** When the user filled out step 1, moved to step 2, then clicked Back, the step 1 form was empty. Data was only saved to Redux on "Next" but not on "Back."

**Fix:** Each step now saves its current form data to Redux before navigating backward. The `handleBack` function dispatches the set action before `prevStep`.

**Lesson:** AI agents implement the happy-path flow (forward navigation) but forget that backward navigation also needs to persist data. Always specify that both directions should save state.

### 2. Validation Not Blocking Next Button

**Issue:** The agent rendered validation errors but did not prevent the `nextStep` action from firing. Users could advance to step 2 with invalid data in step 1.

**Fix:** Step 1 uses `handleSubmit` from `react-hook-form`, which only calls the success handler if validation passes. Steps 2 and 3 run manual validation before dispatching `nextStep`.

**Lesson:** The spec must explicitly state that validation gates navigation. Without this, agents add validation as a visual-only concern.

### 3. No Progress Indicator

**Issue:** The initial implementation had no visual indicator of which step the user was on. The wizard jumped between forms with no context.

**Fix:** Added a `StepIndicator` component that shows 4 numbered circles with connecting lines. Completed steps show checkmarks, the current step is highlighted.

**Lesson:** Progress indicators are so common in wizards that agents often assume they exist. The spec should list the progress indicator as a required component.

### 4. Review Step Doesn't Show Edit Buttons

**Issue:** The review step displayed all collected data as a read-only summary, but there was no way to jump back to a specific step to make corrections without clicking Back three times.

**Fix:** Added Edit buttons next to each section header that dispatch `goToStep(n)` to jump directly to the relevant step.

**Lesson:** Edit affordances on review screens are almost always missed. The spec should list edit buttons as explicit acceptance criteria.

### 5. Submit Doesn't Disable Form During Submission

**Issue:** The Submit button did not show a loading state, and clicking it multiple times sent duplicate API requests. Edit buttons remained active during submission.

**Fix:** Added `isSubmitting` derived from `status === "loading"`. The submit button shows a spinner and "Submitting..." text. All edit and back buttons are disabled during submission.

**Lesson:** Loading states during async operations are missed about 50% of the time. The state matrix catches this by requiring explicit "Submitting" state documentation.

### 6. No Success/Error Feedback After Submit

**Issue:** After successful submission, nothing visible happened. The user had no confirmation. On error, the Redux error was set but never displayed.

**Fix:** Success now triggers a `sonner` toast notification. Errors render as an alert banner above the submit button on the review step.

**Lesson:** Post-submission feedback is frequently omitted. The spec must list both success and error feedback as acceptance criteria, and the state matrix should include the submit-success and submit-error states.

## Acceptance Criteria Results

| AC    | Description                                    | Status |
| ----- | ---------------------------------------------- | ------ |
| AC-1  | Complete all 4 steps and submit                | Pass   |
| AC-2  | Each step validates before allowing Next       | Pass (after fix #2) |
| AC-3  | Back navigation preserves data                 | Pass (after fix #1) |
| AC-4  | Progress indicator shows current/completed     | Pass (after fix #3) |
| AC-5  | Review shows all data with edit buttons        | Pass (after fix #4) |
| AC-6  | Edit buttons navigate to correct step          | Pass   |
| AC-7  | Submit disabled with spinner during API call   | Pass (after fix #5) |
| AC-8  | Success toast after submission                 | Pass (after fix #6) |
| AC-9  | Error banner on API failure                    | Pass (after fix #6) |
| AC-10 | All fields keyboard-accessible with labels     | Pass   |
| AC-11 | Plan cards keyboard-navigable                  | Pass   |
| AC-12 | Responsive 320px to 1440px                     | Pass   |

## Key Takeaways

1. **Multi-step data persistence is the most common gap.** Forward navigation works, but backward navigation almost always loses data without explicit instructions.
2. **Validation gating requires explicit specification.** Agents add validation UI but not validation-as-gate-for-navigation.
3. **Progress indicators need to be listed as components.** They are assumed but not built unless specified.
4. **Review screens need edit affordances.** Read-only summaries without correction paths are the norm in AI-generated code.
5. **Async submission states are incomplete by default.** Loading spinners, disabled states, and post-submission feedback need to be in the state matrix.
6. **The state matrix is essential for multi-step flows.** Each step has its own set of states, and the transitions between steps add another dimension that the matrix captures.
