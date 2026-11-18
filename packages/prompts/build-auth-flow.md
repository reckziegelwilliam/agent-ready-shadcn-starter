# Build Auth Flow

> Target spec: `packages/specs/auth-flow.md`
> Difficulty: Medium

## Context

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **State management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Forms:** `react-hook-form` v7 with `@hookform/resolvers` and `zod` v3
- **UI components:** Imported from `@workspace/ui/components/` (shadcn/ui primitives)
- **Routing:** Next.js App Router file-based routing
- **Slice directory:** `apps/web/features/auth/` (`authSlice.ts` plus `__tests__/`)
- **Components directory:** `apps/web/components/auth/` for the forms and layout
- **Pages directory:** `apps/web/app/(auth)/` for auth route group
- **API:** `apps/api/src/auth/` (NestJS) and the demo-mode mirror in `apps/web/lib/demo-api/store.ts` + `apps/web/app/api/auth/`
- **API base URL:** import `API_URL` from `apps/web/lib/api.ts`; never hardcode `http://localhost:4000`

## Input

1. Read the full spec: `packages/specs/auth-flow.md`
2. Review available shadcn components: `packages/ui/src/components/`
3. Check if a Redux store exists: `apps/web/lib/store/store.ts`
4. Review any existing features in `apps/web/features/` and `apps/web/components/` for conventions

## Instructions

### 1. Build the Redux Slice (types live here)

Create the auth slice with three async thunks. In this repo, a feature's types are exported from its slice file; there is no separate `types.ts`.

- File: `apps/web/features/auth/authSlice.ts`
- Export the `User` and `AuthState` interfaces from the spec. Request/response shapes can stay inline in the thunk signatures.
- Initial state matches `AuthState` from the spec: `{ user: null, token: null, status: "idle", error: null }`.
- Async thunks (call `${API_URL}/auth/...` with `API_URL` from `@/lib/api`):
  - `loginUser` -- POST to `/auth/login`. On success, store `user` and `token`.
  - `registerUser` -- POST to `/auth/register`.
  - `forgotPassword` -- POST to `/auth/forgot-password`. On success, set status to `"succeeded"`.
- Distinguish network failures (fetch throws: "Unable to connect...") from server errors (use the API's `message`).
- Each thunk: `pending` sets `status: "loading"` and clears `error`. `fulfilled` sets `status: "succeeded"` and stores data. `rejected` sets `status: "failed"` and stores `error` message.
- Export a `clearError` action to clear errors when navigating between auth screens, and `logout`.
- Export the reducer as the default export.

### 2. Zod Schemas (co-located with the forms)

Define validation schemas that match every rule in the spec's Validation Rules table. Each schema lives at the top of the form component that uses it (steps 6-8), with its inferred type (`type LoginValues = z.infer<typeof loginSchema>`):

- `loginSchema` in `login-form.tsx`: email (required, valid format) + password (required, min 8 chars).
- `signupSchema` in `signup-form.tsx`: name (required, 2-100 chars) + email + password + confirmPassword (must match password). Use `.refine()` for the password match check.
- `forgotPasswordSchema` in `forgot-password-form.tsx`: email only.

### 3. API Endpoints

The NestJS module already exists in `apps/api/src/auth/` (`auth.controller.ts`, `auth.service.ts`, `auth.module.ts`) and is mirrored for demo mode in `apps/web/lib/demo-api/store.ts` with route handlers in `apps/web/app/api/auth/{login,register,forgot-password}/route.ts`. If you change a contract, change both.

### 4. Ensure shadcn Components Are Available

Before building UI, verify these shadcn/ui components are installed. If any are missing, install them:

```bash
pnpm dlx shadcn@latest add button card input label form -c apps/web
```

Also needed: `sonner` for toasts (success messages after signup).

### 5. Build Shared Components

Create reusable components used across all auth screens.

**`apps/web/components/auth/auth-layout.tsx`**
- Centered layout: full viewport height, content centered vertically and horizontally.
- Renders the app logo (or text placeholder), a `Card` containing `{children}`, and footer links.
- Props: `children`, `title` (rendered as card header), `description` (subtitle text).

**`apps/web/components/auth/password-input.tsx`** (optional: the reference implementation renders plain password `Input`s)
- Wraps shadcn `Input` with type toggle (password/text).
- Renders an eye/eye-off icon button (from `lucide-react`) inside the input's right side.
- Props: all standard input props via `React.ComponentProps<typeof Input>`.
- Accessibility: the toggle button has an `aria-label` of "Show password" / "Hide password".

### 6. Build the Login Form

**`apps/web/components/auth/login-form.tsx`**

- Uses `react-hook-form` with `zodResolver(loginSchema)`.
- Fields: email (`Input`), password (`PasswordInput`).
- Submit button text: "Sign in" (idle) / "Signing in..." with spinner (submitting).
- On submit: dispatch `loginUser` thunk. On success: redirect to `/dashboard` using `useRouter().push()`.
- Error display: if `state.auth.error` is set, render an error banner (`role="alert"`) above the form, with a Retry button for network errors.
- Footer links: "Don't have an account? Sign up" linking to `/signup`, "Forgot your password?" linking to `/forgot-password`.
- On mount, dispatch `clearError` to clear stale errors.

### 7. Build the Signup Form

**`apps/web/components/auth/signup-form.tsx`**

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

**`apps/web/components/auth/forgot-password-form.tsx`**

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
- Pass-through route group layout.

**`apps/web/app/(auth)/login/page.tsx`**
- Renders `LoginForm` inside `AuthLayout` (with `title` and `description`).
- Page metadata: `title: "Sign In"`.

**`apps/web/app/(auth)/signup/page.tsx`**
- Renders `SignupForm` inside `AuthLayout`.
- Page metadata: `title: "Create Account"`.

**`apps/web/app/(auth)/forgot-password/page.tsx`**
- Renders `ForgotPasswordForm` inside `AuthLayout`.
- Page metadata: `title: "Forgot Password"`.

### 10. Register the Slice

Add the auth reducer to the Redux store.

- File: `apps/web/lib/store/store.ts`
- Import `authReducer` from `@/features/auth/authSlice` and add it under the `auth` key in `makeStore()`.
- Components use the typed `useAppDispatch` / `useAppSelector` from `apps/web/lib/store/hooks.ts`.

### 11. Tests

- `apps/web/features/auth/__tests__/authSlice.test.ts` -- reducer and thunk state transitions.
- `apps/web/components/auth/__tests__/login-form.test.tsx` -- validation and submit behavior.

## Output

| File | Action | Description |
| ---- | ------ | ----------- |
| `apps/web/features/auth/authSlice.ts` | Create | Types, async thunks, reducer |
| `apps/web/components/auth/auth-layout.tsx` | Create | Shared centered card layout |
| `apps/web/components/auth/password-input.tsx` | Create (optional) | Password field with visibility toggle |
| `apps/web/components/auth/login-form.tsx` | Create | Login form + `loginSchema` |
| `apps/web/components/auth/signup-form.tsx` | Create | Signup form + `signupSchema` |
| `apps/web/components/auth/forgot-password-form.tsx` | Create | Forgot password form + success state |
| `apps/web/app/(auth)/layout.tsx` | Create | Auth route group layout |
| `apps/web/app/(auth)/login/page.tsx` | Create | Login page |
| `apps/web/app/(auth)/signup/page.tsx` | Create | Signup page |
| `apps/web/app/(auth)/forgot-password/page.tsx` | Create | Forgot password page |
| `apps/web/lib/store/store.ts` | Modify | Register `auth` reducer |
| `apps/web/features/auth/__tests__/authSlice.test.ts` | Create | Slice tests |
| `apps/web/components/auth/__tests__/login-form.test.tsx` | Create | Form tests |

The reference implementation of these files is listed in `examples/auth-flow/README.md`.

## Verification

1. **Type check:** `pnpm typecheck` passes with zero errors.
2. **Lint:** `pnpm lint` passes with zero errors.
3. **Visual -- Login:** Navigate to `/login`. Verify empty form renders. Submit empty form and see validation errors. Enter invalid email and see error. Submit `demo@example.com` / `password123` and verify success.
4. **Visual -- Signup:** Navigate to `/signup`. Verify password strength indicator updates as you type. Submit with mismatched passwords and see error. Submit with duplicate email and see server error.
5. **Visual -- Forgot Password:** Navigate to `/forgot-password`. Submit valid email and verify form is replaced by success message.
6. **Accessibility:** Tab through every form. Verify labels are linked to inputs. Verify errors are announced (check `aria-describedby`). Verify focus moves to first error field on submit.
7. **Responsive:** Resize from 320px to 1440px. Verify the card layout adapts without horizontal scroll.
8. **Spec coverage:** Walk through every acceptance criterion in `packages/specs/auth-flow.md` and confirm each passes.
9. **Review:** Run `packages/review-checklists/frontend-component.md` against each component.
