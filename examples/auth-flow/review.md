# Auth Flow -- Post-Implementation Review

This document captures lessons from building the auth flow with an AI agent, including common mistakes and how they were corrected.

## What the AI Got Right

**Form structure and wiring.** The agent correctly set up `react-hook-form` with `zodResolver`, created appropriate field components, and wired the submit handler to dispatch the Redux thunk. The form-to-API pipeline worked on the first pass.

**Zod schema accuracy.** Validation rules from the spec were translated into `zod` schemas accurately, including the `.refine()` for confirm-password matching and the regex pattern for email validation.

**Redux slice structure.** The async thunk pattern (pending/fulfilled/rejected) was implemented correctly with proper error extraction using `rejectWithValue`.

**Component decomposition.** The agent correctly identified `AuthLayout`, `PasswordInput`, and `PasswordStrengthIndicator` as reusable components and extracted them.

## Common Mistakes Caught

### 1. Missing Error State Reset

**Issue:** When navigating from `/login` to `/signup`, the error banner from a failed login attempt persisted because the Redux `error` state was not cleared.

**Fix:** Added a `resetAuthState` action to the slice and dispatched it in a `useEffect` on each form component's mount:
```typescript
useEffect(() => {
  dispatch(resetAuthState());
}, [dispatch]);
```

**Lesson:** AI agents rarely think about cross-screen state pollution. Always include a reset mechanism for error states.

### 2. Hardcoded Error Messages

**Issue:** The agent hardcoded error messages like "Invalid email or password" in the component instead of using the message from the API response.

**Fix:** Changed the error display to use `authError` from the Redux store, which is populated from the API response via `rejectWithValue`.

**Lesson:** Specify in the prompt that error messages should come from the API response, not be hardcoded in the UI.

### 3. Missing Focus Management on Validation Errors

**Issue:** When the form was submitted with invalid fields, the validation errors appeared but focus stayed on the submit button. Screen reader users had no way of knowing which field failed.

**Fix:** Added `shouldFocusError: true` to the `useForm` configuration (this is the default in `react-hook-form`, but the agent had explicitly set it to `false` for unknown reasons). Also added `aria-describedby` linking each input to its error message element.

**Lesson:** Always check accessibility criteria explicitly. The agent generated `aria-describedby` attributes but set them incorrectly (pointing to non-existent IDs).

### 4. Password Visibility Toggle Not Accessible

**Issue:** The show/hide password button was an icon without any text or `aria-label`. Screen reader users could not identify its purpose.

**Fix:** Added `aria-label="Show password"` / `aria-label="Hide password"` that toggles with the state. Also made the button `type="button"` to prevent it from submitting the form.

**Lesson:** Icon-only buttons are a consistent accessibility gap in AI-generated code. The review checklist catches this reliably.

### 5. No Loading State on Forgot Password Success

**Issue:** The forgot-password form submitted successfully but showed a brief flash of the empty form before the success message appeared, because the success state check ran after the form re-rendered.

**Fix:** Restructured the component to check `status === "succeeded"` before rendering the form, and used a transition to smoothly swap between form and success message.

**Lesson:** State transitions between "submitting" and "success" need careful ordering. Tell the agent to render the success state first in the conditional chain.

### 6. Password Strength Indicator Not Updating

**Issue:** The `PasswordStrengthIndicator` received the password value as a prop but only evaluated strength on mount, not on changes.

**Fix:** The strength calculation was inside a `useMemo` with an empty dependency array. Changed it to `[password]` so it recalculates on every keystroke.

**Lesson:** AI agents frequently write `useMemo` and `useEffect` with incorrect dependency arrays. Review these carefully.

## Acceptance Criteria Results

| AC   | Description                                    | Status |
| ---- | ---------------------------------------------- | ------ |
| AC-1 | Login with valid credentials redirects         | Pass   |
| AC-2 | Invalid credentials show inline error          | Pass (after fix #2) |
| AC-3 | Fields disabled during submission              | Pass   |
| AC-4 | Client validation on blur and submit           | Pass   |
| AC-5 | Keyboard accessible, screen reader friendly    | Pass (after fixes #3, #4) |
| AC-6 | Signup redirects to login with toast           | Pass   |
| AC-7 | Password strength updates on keystroke         | Pass (after fix #6) |
| AC-8 | Password mismatch error                        | Pass   |
| AC-9 | Duplicate email error                          | Pass   |
| AC-10| Signup form accessible                         | Pass (after fixes #3, #4) |
| AC-11| Forgot password shows success message          | Pass (after fix #5) |
| AC-12| Success replaces form, not an overlay          | Pass   |
| AC-13| Rate limiting on forgot password               | Pass   |
| AC-14| Token stored in Redux                          | Pass   |
| AC-15| Responsive 320px to 1440px                     | Pass   |
| AC-16| Logical tab order, focus on first error        | Pass (after fix #3) |

## Key Takeaways

1. **Error state management is the most common gap.** The agent handles the happy path well but misses error clearing, error propagation, and error-to-recovery transitions.
2. **Accessibility requires explicit review.** The agent generates ARIA attributes but frequently attaches them incorrectly. Manual testing with a screen reader is essential.
3. **`useEffect` and `useMemo` dependency arrays are error-prone.** Review every hook's dependency array against its actual dependencies.
4. **Cross-screen state is overlooked.** When a feature spans multiple pages, the agent does not think about state that bleeds between them.
5. **The spec pays for itself.** Every issue caught was either something the spec explicitly required (and the agent missed) or something the spec could have prevented if the requirement were more explicit.
