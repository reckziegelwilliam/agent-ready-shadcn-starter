# Auth Flow

> Spec version: 1.0

## Overview

A complete authentication flow covering login, signup, and forgot-password. Users authenticate with email and password. The flow uses `react-hook-form` for form state, `zod` for validation schemas, and shadcn/ui form components. Auth state is managed in a Redux Toolkit slice with async thunks for API calls.

## User Stories

- **As a** new user, **I want to** create an account with my email and password, **so that** I can access the application.
- **As a** returning user, **I want to** log in with my credentials, **so that** I can resume where I left off.
- **As a** user who forgot my password, **I want to** request a password reset email, **so that** I can regain access to my account.

## Screens / Components

### Screen: Login

**Route:** `/login`

**Description:** A centered card with email and password fields, a submit button, and links to signup and forgot-password.

**Components:**
- `LoginForm` -- The form itself. Uses `react-hook-form` with a `zod` resolver. Dispatches the `login` async thunk on submit.
- `AuthLayout` -- Shared centered layout wrapper used by all auth screens. Renders logo, card container, and footer links.
- `PasswordInput` -- Password field with show/hide toggle. Wraps shadcn `Input` with an eye icon button.

### Screen: Signup

**Route:** `/signup`

**Description:** A centered card with name, email, password, and confirm-password fields. Includes a link back to login.

**Components:**
- `SignupForm` -- Form with `react-hook-form` and `zod`. Dispatches the `register` async thunk. Validates that password and confirm-password match on the client.
- `AuthLayout` -- Same shared layout.
- `PasswordInput` -- Reused from login.
- `PasswordStrengthIndicator` -- Visual bar showing password strength (weak/fair/strong). Updates on every keystroke.

### Screen: Forgot Password

**Route:** `/forgot-password`

**Description:** A centered card with an email field. On success, shows a confirmation message instead of redirecting.

**Components:**
- `ForgotPasswordForm` -- Single-field form. Dispatches the `forgotPassword` async thunk.
- `AuthLayout` -- Same shared layout.
- `SuccessMessage` -- Displayed after successful submission. Shows an email icon and instructions to check inbox.

## States

### Login

| State      | Condition                          | What the User Sees                                                      |
| ---------- | ---------------------------------- | ----------------------------------------------------------------------- |
| Idle       | Page loaded, no interaction        | Empty email and password fields, enabled "Sign in" button               |
| Validating | User has interacted, blur/submit   | Inline field errors shown beneath invalid fields                        |
| Submitting | Form submitted, API call in flight | All fields disabled, "Sign in" button shows spinner, text "Signing in..." |
| Error      | API returned 401 or 500            | Fields re-enabled, error banner: "Invalid email or password" or generic |
| Success    | API returned 200 with token        | Redirect to `/dashboard`                                                |

### Signup

| State      | Condition                           | What the User Sees                                                         |
| ---------- | ----------------------------------- | -------------------------------------------------------------------------- |
| Idle       | Page loaded                         | Empty fields, enabled "Create account" button                              |
| Validating | User interacted with fields         | Inline errors, password strength indicator updates                         |
| Submitting | Form submitted                      | All fields disabled, button shows spinner, text "Creating account..."      |
| Error      | API returned 409 (conflict) or 500  | Error banner: "An account with this email already exists" or generic       |
| Success    | API returned 201                    | Redirect to `/login` with success toast: "Account created. Please sign in." |

### Forgot Password

| State      | Condition             | What the User Sees                                                          |
| ---------- | --------------------- | --------------------------------------------------------------------------- |
| Idle       | Page loaded           | Email field, enabled "Send reset link" button                               |
| Validating | User interacted       | Inline email validation error                                               |
| Submitting | Form submitted        | Field disabled, button shows spinner                                        |
| Error      | API returned 500      | Error banner with generic message (never reveal if email exists)            |
| Success    | API returned 200      | Form replaced by `SuccessMessage` component with check-inbox instructions   |

## Data Models

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  createdAt: string; // ISO 8601
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
```

## API Contracts

### `POST /api/auth/login`

**Description:** Authenticate a user with email and password.

**Request:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response (200):**
```typescript
interface LoginResponse {
  user: User;
  token: string;
}
```

**Error Responses:**

| Status | Code                 | Message                              |
| ------ | -------------------- | ------------------------------------ |
| 401    | `INVALID_CREDENTIALS`| "Invalid email or password"          |
| 422    | `VALIDATION_ERROR`   | `{ errors: { field: message } }`     |
| 429    | `RATE_LIMITED`       | "Too many attempts. Try again later" |
| 500    | `INTERNAL_ERROR`     | "Something went wrong"               |

### `POST /api/auth/register`

**Description:** Create a new user account.

**Request:**
```typescript
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
```

**Response (201):**
```typescript
interface RegisterResponse {
  user: User;
}
```

**Error Responses:**

| Status | Code                | Message                                     |
| ------ | ------------------- | ------------------------------------------- |
| 409    | `EMAIL_EXISTS`      | "An account with this email already exists" |
| 422    | `VALIDATION_ERROR`  | `{ errors: { field: message } }`            |
| 500    | `INTERNAL_ERROR`    | "Something went wrong"                      |

### `POST /api/auth/forgot-password`

**Description:** Send a password reset email. Always returns 200 regardless of whether the email exists (to prevent email enumeration).

**Request:**
```typescript
interface ForgotPasswordRequest {
  email: string;
}
```

**Response (200):**
```typescript
interface ForgotPasswordResponse {
  message: "If an account exists, a reset link has been sent.";
}
```

**Error Responses:**

| Status | Code               | Message                |
| ------ | ------------------ | ---------------------- |
| 422    | `VALIDATION_ERROR` | Invalid email format   |
| 429    | `RATE_LIMITED`     | "Too many attempts"    |
| 500    | `INTERNAL_ERROR`   | "Something went wrong" |

## Validation Rules

| Field              | Rule                                          | Error Message                                    |
| ------------------ | --------------------------------------------- | ------------------------------------------------ |
| `email`            | Required; matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | "Please enter a valid email address"          |
| `password`         | Required; min 8 chars                         | "Password must be at least 8 characters"         |
| `password`         | Must contain at least one letter and one number | "Password must contain a letter and a number"  |
| `name`             | Required; min 2 chars; max 100 chars          | "Name must be between 2 and 100 characters"      |
| `confirmPassword`  | Required; must match `password`               | "Passwords do not match"                         |

## Acceptance Criteria

### Login
- [ ] **AC-1:** User can log in with a valid email and password and is redirected to `/dashboard`.
- [ ] **AC-2:** Invalid credentials show an inline error banner without revealing which field is wrong.
- [ ] **AC-3:** Form fields are disabled and button shows a spinner while the API call is in flight.
- [ ] **AC-4:** Client-side validation errors appear on blur and on submit.
- [ ] **AC-5:** All form fields are accessible via keyboard. Labels are associated with inputs. Errors are announced to screen readers via `aria-describedby`.

### Signup
- [ ] **AC-6:** User can create an account and is redirected to `/login` with a success toast.
- [ ] **AC-7:** Password strength indicator updates on every keystroke.
- [ ] **AC-8:** "Passwords do not match" error appears when confirm-password differs from password.
- [ ] **AC-9:** Duplicate email returns a clear error without exposing other user data.
- [ ] **AC-10:** All form fields are keyboard-accessible and screen-reader-friendly.

### Forgot Password
- [ ] **AC-11:** User submits email and sees a success message regardless of whether the email exists.
- [ ] **AC-12:** Success message replaces the form (not an overlay or toast).
- [ ] **AC-13:** Rate limiting prevents rapid repeated submissions.

### Cross-Cutting
- [ ] **AC-14:** Auth token is stored in the Redux store and attached to subsequent API requests.
- [ ] **AC-15:** All three screens are responsive from 320px to 1440px.
- [ ] **AC-16:** Tab order is logical on all screens. Focus moves to the first error field on failed validation.

## Out of Scope

- OAuth / social login (Google, GitHub, etc.)
- Email verification flow
- Password reset form (the page you land on from the reset email)
- Session refresh / token rotation
- "Remember me" functionality

## Open Questions

- [ ] Should the signup flow auto-login the user, or require them to log in separately?
- [ ] What is the rate limit threshold for forgot-password (e.g., 3 per hour)?
