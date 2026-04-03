# Spec to Page

> Target spec: the spec file provided as input
> Difficulty: Medium

## Context

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **State management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) with typed hooks in `apps/web/lib/store/hooks.ts`
- **Forms:** `react-hook-form` v7 with `@hookform/resolvers` and `zod` v3
- **UI components:** Imported from `@workspace/ui/components/` (shadcn/ui primitives)
- **Utilities:** `cn()` from `@workspace/ui/lib/utils` for conditional class merging
- **Feature directory:** `apps/web/features/<feature>/` for slice, types, schemas
- **Components directory:** `apps/web/components/<feature>/` for UI components
- **Pages directory:** `apps/web/app/<route>/page.tsx` for Next.js routes
- **State conventions:** Every component must handle idle, loading, success, error, and empty states explicitly. No state should be left as "falls through to default."

## Input

1. Read the product spec file provided by the user (e.g., `packages/specs/<feature>.md`).
2. Read the state matrix file if one exists (e.g., `packages/specs/<feature>-states.md`).
3. Review existing feature implementations for patterns: `apps/web/features/auth/authSlice.ts`, `apps/web/components/auth/login-form.tsx`.
4. Check available shadcn/ui components: `packages/ui/src/components/`.
5. Review the Redux store configuration: `apps/web/lib/store/store.ts`.

## Instructions

### 1. Read and Analyze the Spec

Thoroughly read the spec file. Identify every screen, every data model, every validation rule, and every acceptance criterion. Create a mental checklist of what needs to be built.

### 2. Identify All States from the State Matrix

If a state matrix file exists, read it. For every state marked "Not implemented" or "Partial," plan how to implement it. If no state matrix exists, enumerate the following states for each screen: idle, loading, success, error (validation), error (server), error (network), empty, and permission denied.

### 3. Define TypeScript Types and Zod Schemas

- Create `apps/web/features/<feature>/types.ts` with all interfaces from the spec's data model section.
- Create `apps/web/features/<feature>/schemas.ts` with Zod schemas matching every validation rule. Export inferred types using `z.infer<typeof schema>`.

### 4. Build the Redux Slice

- Create `apps/web/features/<feature>/<feature>Slice.ts`.
- Define initial state matching the type interface with `status: 'idle'` and `error: null`.
- Create async thunks for each API endpoint. Wrap `fetch` calls in try/catch to distinguish network errors from server errors (network errors should set a message containing "Unable to connect").
- Handle `pending`, `fulfilled`, and `rejected` for each thunk.
- Export a `clearError` action and relevant selectors.

### 5. Create Composable UI Components

- Create one file per logical component in `apps/web/components/<feature>/`.
- Each component must use shadcn/ui primitives from `@workspace/ui/components/`.
- Never hardcode mock data inside view components. Accept data via props or Redux selectors.
- Implement every state: render a skeleton or spinner for loading, a centered message for empty, an error banner for errors, and the full UI for success.

### 6. Wire Up Forms with Validation

- Use `react-hook-form` with `zodResolver` for every form.
- Set `mode: "onBlur"` for validation timing.
- Display inline errors below each field with `aria-describedby` linking to the error element.
- Display server errors in a banner above the form. Display network errors with a distinct amber banner and WiFi icon.

### 7. Create the Next.js Page

- Create `apps/web/app/<route>/page.tsx`.
- Import and compose all components.
- Connect to Redux using `useAppDispatch` and `useAppSelector`.
- Dispatch `clearError` on mount to prevent stale error states from previous navigation.

### 8. Register the Slice in the Store

- Import the reducer in `apps/web/lib/store/store.ts` and add it under the appropriate key.

### 9. Test Each State Manually

- Verify idle renders cleanly with no console errors.
- Trigger loading state and confirm spinner/skeleton appears.
- Trigger success and confirm data renders.
- Trigger validation errors and confirm inline messages appear.
- Trigger server error (e.g., by temporarily changing the API URL) and confirm error banner appears.
- Trigger network error (e.g., by disabling network in DevTools) and confirm distinct amber banner appears with retry button.

### 10. Verify Against Spec Acceptance Criteria

- Walk through every acceptance criterion in the spec. Confirm each one passes.
- If a state matrix exists, confirm every "Done" row is actually working.

## Output

| File | Action | Description |
| ---- | ------ | ----------- |
| `apps/web/features/<feature>/types.ts` | Create | TypeScript interfaces from spec |
| `apps/web/features/<feature>/schemas.ts` | Create | Zod validation schemas |
| `apps/web/features/<feature>/<feature>Slice.ts` | Create | Redux slice with async thunks |
| `apps/web/components/<feature>/*.tsx` | Create | UI components (one per file) |
| `apps/web/app/<route>/page.tsx` | Create | Next.js page wiring everything together |
| `apps/web/lib/store/store.ts` | Modify | Register new slice reducer |

## Verification

1. **Type check:** Run `pnpm typecheck` from the monorepo root. Zero errors.
2. **Lint:** Run `pnpm lint`. Zero errors.
3. **Idle state:** Page loads without console errors, form/UI renders in default state.
4. **Loading state:** Spinner or skeleton appears during async operations.
5. **Success state:** Data renders correctly after successful fetch/submit.
6. **Validation errors:** Each field shows inline error on blur with invalid input.
7. **Server error:** Error banner appears when API returns non-2xx response.
8. **Network error:** Distinct amber banner with WiFi icon and retry button appears when fetch throws.
9. **Empty state:** Centered message with optional CTA appears when no data exists.
10. **Accessibility:** Tab through all interactive elements, verify focus order, confirm `aria-describedby` on error fields.
11. **Responsive:** Verify layout from 320px to 1440px without horizontal scroll.
12. **Spec coverage:** Every acceptance criterion in the spec passes.
