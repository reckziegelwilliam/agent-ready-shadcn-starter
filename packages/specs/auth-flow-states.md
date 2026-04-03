# State Matrix: Auth Flow

> Documents every user-facing state across the authentication screens. States marked "Not implemented" are known gaps.

## Screens

### Login (`/login`)

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Idle** | Page loads, no interaction | Clean form with email/password fields, placeholders | Default render | Done |
| **Loading** | Login API call in flight | Spinner on submit button, fields visually disabled | `status === 'loading'` in authSlice, button `disabled` prop | Done |
| **Success** | API returns 200 with token | Brief success state before redirect | `status === 'succeeded'`, `loginUser.fulfilled` | Done |
| **Error (validation)** | Invalid email format or password < 8 chars | Red field border, inline error message below field | Zod schema + react-hook-form `mode: "onBlur"` | Done |
| **Error (server)** | API returns 401 | Error banner above form: "Invalid email or password" | `state.error` from `loginUser.rejected` | Done |
| **Error (network)** | No connectivity / API unreachable | Unhandled — shows generic rejection error | Caught by thunk rejection but no offline detection | Not implemented |
| **Permission denied** | Account locked or suspended | No distinct handling — falls through to server error | N/A for login (would need account status API) | N/A |
| **Rate limited** | Too many failed attempts | No handling — API would need to return 429 | Neither API nor UI implements rate limiting | Not implemented |

### Signup (`/signup`)

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Idle** | Page loads, no interaction | Form with name, email, password, confirm password | Default render | Done |
| **Loading** | Register API call in flight | Spinner on submit button | `status === 'loading'` | Done |
| **Success** | API returns 200 with token | Brief success state before redirect | `status === 'succeeded'`, `registerUser.fulfilled` | Done |
| **Error (validation)** | Name empty, bad email, short password, mismatch | Inline error per field on blur | Zod `.refine()` for password match | Done |
| **Error (server: conflict)** | API returns 409 — email exists | Error banner: "Email already registered" | `registerUser.rejected` | Done |
| **Error (server: other)** | API returns 500 | Generic error message | Caught by thunk rejection | Partial |
| **Error (network)** | No connectivity | Unhandled — generic error | No offline detection | Not implemented |
| **Password strength feedback** | User types password | No real-time strength indicator | Only min-length validation via Zod | Not implemented |

### Forgot Password (`/forgot-password`)

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Idle** | Page loads | Email-only form with explanation text | Default render | Done |
| **Loading** | Forgot-password API call in flight | Spinner on submit button | `status === 'loading'` | Done |
| **Success** | API returns 200 | Form replaced with "Check your email" message + envelope icon | `status === 'succeeded'` conditional render | Done |
| **Error (validation)** | Invalid email format | Inline error below email field | Zod email validation | Done |
| **Error (server)** | API returns error | Error banner | `forgotPassword.rejected` | Done |
| **Error (network)** | No connectivity | Unhandled | No offline detection | Not implemented |
| **Resend** | User wants to send again | No resend button on success screen | Would need to reset status and re-show form | Not implemented |

## Gap Summary

| Gap | Screens Affected | Priority | Notes |
|-----|-----------------|----------|-------|
| Offline/network error handling | All 3 | Medium | Need navigator.onLine check or fetch error type detection |
| Rate limiting | Login | Low | Requires API-side implementation first |
| Password strength indicator | Signup | Low | UX enhancement, not a correctness issue |
| Resend flow | Forgot password | Medium | Common UX pattern, currently missing |
| Account lockout display | Login | Low | Requires account status API |

## AI Agent Observations

When generating this auth flow, AI agents consistently:
1. Implemented all happy-path states correctly
2. Handled client validation well (Zod integration)
3. Missed `clearError` on component mount (stale error from previous attempt)
4. Did not distinguish between network errors and server errors
5. Did not consider rate limiting or account lockout scenarios
6. Generated hardcoded error strings instead of using API response messages
