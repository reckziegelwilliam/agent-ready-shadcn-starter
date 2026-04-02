# Build Auth Flow

> Target spec: `packages/specs/auth-flow.md`
> Difficulty: Medium

## Context

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **State management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Forms:** `react-hook-form` v7 with `@hookform/resolvers` and `zod` v3
- **UI components:** Imported from `@workspace/ui/components/` (shadcn/ui primitives)
- **Routing:** Next.js App Router file-based routing
- **Feature directory:** `apps/web/features/auth/` for all auth-related code
- **Pages directory:** `apps/web/app/(auth)/` for auth route group

## Input

1. Read the full spec: `packages/specs/auth-flow.md`
2. Review available shadcn components: `packages/ui/src/components/`
3. Check if a Redux store exists: `apps/web/lib/store.ts`
4. Review any existing features in `apps/web/features/` for conventions

## Instructions

### 1. Define Types

Create the TypeScript interfaces for the auth domain.

- File: `apps/web/features/auth/types.ts`
- Define `User`, `AuthState`, `LoginRequest`, `LoginResponse`, `RegisterRequest`, `RegisterResponse`, `ForgotPasswordRequest`, `ForgotPasswordResponse` exactly as specified in the spec.
- Export all interfaces.

### 2. Create Zod Schemas

Define validation schemas that match every rule in the spec's Validation Rules table.

- File: `apps/web/features/auth/schemas.ts`
- `loginSchema`: email (required, valid format) + password (required, min 8 chars, must contain letter and number).
- `signupSchema`: name (required, 2-100 chars) + email + password + confirmPassword (must match password). Use `.refine()` for the password match check.
- `forgotPasswordSchema`: email only.
- Export each schema and its inferred TypeScript type using `z.infer<typeof schema>`.

### 3. Build the Redux Slice

Create the auth slice with three async thunks.

- File: `apps/web/features/auth/slice.ts`
- Initial state matches `AuthState` from the spec: `{ user: null, token: null, status: "idle", error: null }`.
- Async thunks:
  - `login` -- POST to `/api/auth/login`. On success, store `user` and `token`.
  - `register` -- POST to `/api/auth/register`. On success, do not auto-login (per spec's open question, default to requiring separate login).
  - `forgotPassword` -- POST to `/api/auth/forgot-password`. On success, set status to `"succeeded"`.
- Each thunk: `pending` sets `status: "loading"` and clears `error`. `fulfilled` sets `status: "succeeded"` and stores data. `rejected` sets `status: "failed"` and stores `error` message.
- Export selectors: `selectUser`, `selectToken`, `selectAuthStatus`, `selectAuthError`.
- Export a `resetAuthState` action to clear errors when navigating between auth screens.

### 4. Ensure shadcn Components Are Available

Before building UI, verify these shadcn/ui components are installed. If any are missing, install them:

```bash
pnpm dlx shadcn@latest add button card input label form -c apps/web
```

Also needed: `sonner` for toasts (success messages after signup).

### 5. Build Shared Components

Create reusable components used across all auth screens.

**`apps/web/features/auth/components/auth-layout.tsx`**
- Centered layout: full viewport height, content centered vertically and horizontally.
- Renders the app logo (or text placeholder), a `Card` containing `{children}`, and footer links.
- Props: `children`, `title` (rendered as card header), `description` (subtitle text).

**`apps/web/features/auth/components/password-input.tsx`**
- Wraps shadcn `Input` with type toggle (password/text).
- Renders an eye/eye-off icon button (from `lucide-react`) inside the input's right side.
- Props: all standard input props via `React.ComponentProps<typeof Input>`.
- Accessibility: the toggle button has an `aria-label` of "Show password" / "Hide password".

### 6. Build the Login Form

**`apps/web/features/auth/components/login-form.tsx`**

- Uses `react-hook-form` with `zodResolver(loginSchema)`.
- Fields: email (`Input`), password (`PasswordInput`).
- Submit button text: "Sign in" (idle) / "Signing in..." with spinner (submitting).
- On submit: dispatch `login` thunk. On success: redirect to `/dashboard` using `useRouter().push()`.
- Error display: if `authError` exists in Redux state, render an error `Alert` above the form.
- Footer links: "Don't have an account? Sign up" linking to `/signup`, "Forgot your password?" linking to `/forgot-password`.
- On mount or when navigating to this page, dispatch `resetAuthState` to clear stale errors.

### 7. Build the Signup Form

**`apps/web/features/auth/components/signup-form.tsx`**

- Uses `react-hook-form` with `zodResolver(signupSchema)`.
- Fields: name, email, password (with `PasswordInput`), confirmPassword (with `PasswordInput`).
- Include a `PasswordStrengthIndicator` component (can be inline or separate file):
  - Calculates strength based on: length >= 8 (weak), + has number (fair), + has uppercase + special char (strong).
  - Renders a segmented bar (3 segments) with color: red (weak), yellow (fair), green (strong).
  - Text label beneath: "Weak", "Fair", "Strong".
- Submit button text: "Create account" / "Creating account...".
- On success: redirect to `/login`, show a toast via `sonner`: "Account created. Please sign in."
- Footer link: "Already have an account? Sign in" linking to `/login`.

### 8. Build the Forgot Password Form

**`apps/web/features/auth/components/forgot-password-form.tsx`**

- Uses `react-hook-form` with `zodResolver(forgotPasswordSchema)`.
- Single field: email.
- Submit button text: "Send reset link" / "Sending...".
- On success: replace the entire form with a `SuccessMessage` component (not a toast):
  - Icon: mail check icon from `lucide-react`.
  - Heading: "Check your email".
  - Body: "If an account exists for that email, we sent a password reset link."
  - Link: "Back to sign in" linking to `/login`.
- Footer link: "Back to sign in" linking to `/login`.

### 9. Create the Route Pages

Create three pages using the Next.js App Router route group pattern.

**`apps/web/app/(auth)/layout.tsx`**
- Renders `AuthLayout` as the wrapper. This keeps the auth chrome consistent.

**`apps/web/app/(auth)/login/page.tsx`**
- Renders `LoginForm`.
- Page metadata: `title: "Sign In"`.

**`apps/web/app/(auth)/signup/page.tsx`**
- Renders `SignupForm`.
- Page metadata: `title: "Create Account"`.

**`apps/web/app/(auth)/forgot-password/page.tsx`**
- Renders `ForgotPasswordForm`.
- Page metadata: `title: "Forgot Password"`.

### 10. Register the Slice

Add the auth reducer to the Redux store.

- File: `apps/web/lib/store.ts` (create if it does not exist)
- Import `authReducer` from `features/auth/slice` and add it under the `auth` key.
- If the store file does not exist, create it with `configureStore`, a root `RootState` type, and an `AppDispatch` type.
- Also create `apps/web/lib/hooks.ts` with typed `useAppDispatch` and `useAppSelector` hooks if they do not exist.

## Output

| File | Action | Description |
| ---- | ------ | ----------- |
| `apps/web/features/auth/types.ts` | Create | TypeScript interfaces |
| `apps/web/features/auth/schemas.ts` | Create | Zod validation schemas |
| `apps/web/features/auth/slice.ts` | Create | Redux slice with async thunks |
| `apps/web/features/auth/components/auth-layout.tsx` | Create | Shared centered layout |
| `apps/web/features/auth/components/password-input.tsx` | Create | Password field with visibility toggle |
| `apps/web/features/auth/components/login-form.tsx` | Create | Login form component |
| `apps/web/features/auth/components/signup-form.tsx` | Create | Signup form with strength indicator |
| `apps/web/features/auth/components/forgot-password-form.tsx` | Create | Forgot password form with success state |
| `apps/web/app/(auth)/layout.tsx` | Create | Auth route group layout |
| `apps/web/app/(auth)/login/page.tsx` | Create | Login page |
| `apps/web/app/(auth)/signup/page.tsx` | Create | Signup page |
| `apps/web/app/(auth)/forgot-password/page.tsx` | Create | Forgot password page |
| `apps/web/lib/store.ts` | Create/Modify | Redux store configuration |
| `apps/web/lib/hooks.ts` | Create/Modify | Typed Redux hooks |

## Verification

1. **Type check:** `pnpm typecheck` passes with zero errors.
2. **Lint:** `pnpm lint` passes with zero errors.
3. **Visual -- Login:** Navigate to `/login`. Verify empty form renders. Submit empty form and see validation errors. Enter invalid email and see error. Submit valid credentials and verify redirect.
4. **Visual -- Signup:** Navigate to `/signup`. Verify password strength indicator updates as you type. Submit with mismatched passwords and see error. Submit with duplicate email and see server error.
5. **Visual -- Forgot Password:** Navigate to `/forgot-password`. Submit valid email and verify form is replaced by success message.
6. **Accessibility:** Tab through every form. Verify labels are linked to inputs. Verify errors are announced (check `aria-describedby`). Verify focus moves to first error field on submit.
7. **Responsive:** Resize from 320px to 1440px. Verify the card layout adapts without horizontal scroll.
8. **Spec coverage:** Walk through every acceptance criterion in `packages/specs/auth-flow.md` and confirm each passes.
9. **Review:** Run `packages/review-checklists/frontend-component.md` against each component.
