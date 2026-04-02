# Auth Flow Example

This example demonstrates how an AI agent builds a complete authentication flow from a structured spec.

## What This Covers

- **Login** -- Email/password form with validation, error handling, and redirect on success
- **Signup** -- Registration form with password strength indicator and confirm-password matching
- **Forgot Password** -- Email-only form that transitions to a success message on submit

## Tech Stack Used

- **Forms:** `react-hook-form` with `@hookform/resolvers/zod`
- **Validation:** `zod` schemas matching the spec's validation rules
- **State:** Redux Toolkit slice with async thunks for each auth endpoint
- **UI:** shadcn/ui `Card`, `Input`, `Button`, `Form`, `Label`, `Alert` components
- **Routing:** Next.js App Router with an `(auth)` route group for shared layout

## Files Produced

```
apps/web/features/auth/
  types.ts              -- User, AuthState, request/response interfaces
  schemas.ts            -- loginSchema, signupSchema, forgotPasswordSchema
  slice.ts              -- Auth slice with login, register, forgotPassword thunks
  components/
    auth-layout.tsx     -- Centered card layout shared by all auth screens
    password-input.tsx  -- Input with show/hide password toggle
    login-form.tsx      -- Login form component
    signup-form.tsx     -- Signup form with password strength indicator
    forgot-password-form.tsx -- Forgot password with inline success state

apps/web/app/(auth)/
  layout.tsx            -- Route group layout wrapping AuthLayout
  login/page.tsx        -- Login page
  signup/page.tsx       -- Signup page
  forgot-password/page.tsx -- Forgot password page
```

## How to Reproduce

1. Read the spec: [`packages/specs/auth-flow.md`](../../packages/specs/auth-flow.md)
2. Feed the prompt to your AI agent: [`packages/prompts/build-auth-flow.md`](../../packages/prompts/build-auth-flow.md)
3. The agent produces the files listed above.
4. Run the review: [`packages/review-checklists/full-feature.md`](../../packages/review-checklists/full-feature.md)

## How to Run

```bash
# From the monorepo root
pnpm dev

# Navigate to:
# http://localhost:3000/login
# http://localhost:3000/signup
# http://localhost:3000/forgot-password
```

## Key Patterns Demonstrated

- **Spec-driven development:** The spec defines every state, validation rule, and acceptance criterion. The agent implements them all.
- **Form + validation pipeline:** `zod` schema -> `react-hook-form` resolver -> field-level error rendering -> async submission.
- **State machine in Redux:** The `status` field drives the UI: idle shows the form, loading disables it, error shows a banner, success triggers navigation.
- **Shared layout via route groups:** The `(auth)` route group applies `AuthLayout` to all auth pages without affecting other routes.

## Review Notes

See [`review.md`](./review.md) for a post-implementation analysis of what the AI got right, what it missed, and what was corrected.
