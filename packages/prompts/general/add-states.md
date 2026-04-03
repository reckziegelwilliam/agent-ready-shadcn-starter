# Add States

> Target spec: the state matrix file provided as input
> Difficulty: Medium

## Context

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **State management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **UI components:** Imported from `@workspace/ui/components/` (shadcn/ui primitives)
- **Icons:** `lucide-react` for all icons (AlertCircle, WifiOff, Loader2, Inbox, etc.)
- **Utilities:** `cn()` from `@workspace/ui/lib/utils`
- **State matrix convention:** Each feature has a state matrix at `packages/specs/<feature>-states.md` documenting every user-facing state, its condition, expected UI, and implementation status.
- **Goal:** Fill in all "Not implemented" states so that every row in the state matrix is covered. AI-generated code frequently handles happy paths well but misses loading, empty, error (server), error (network), and offline states. This prompt fixes those gaps systematically.

## Input

1. Read the component(s) to update, as specified by the user.
2. Read the state matrix: `packages/specs/<feature>-states.md`.
3. Read the Redux slice for this feature: `apps/web/features/<feature>/<feature>Slice.ts`.
4. Review existing state handling patterns in `apps/web/components/auth/login-form.tsx` for reference on how error states are implemented.

## Instructions

### 1. Catalog Missing States

Read the state matrix file. List every row where the Status column is "Not implemented" or "Partial." For each one, note:

- The state name (e.g., "Error (network)")
- The condition that triggers it (e.g., "No connectivity")
- The expected UI (e.g., "Amber banner with WiFi icon and retry button")

### 2. Implement Loading State

If the component does not already show a loading indicator:

- Add a `loading` boolean derived from Redux state (`status === 'loading'`) or a local `useState`.
- Render a skeleton (for content areas) or a spinner (for buttons) during loading.
- Disable form inputs and submit buttons while loading.
- For data tables, use a `DataTableLoading` component with shimmer rows.

### 3. Implement Empty State

If the component does not handle the case where data is empty:

- Check for `data.length === 0` after loading completes.
- Render a centered layout with an icon (e.g., `Inbox`), a heading ("No items found"), a description, and an optional CTA button.
- Distinguish between "no data exists" and "no data matches current filters" if filtering is present.

### 4. Implement Server Error State

If the component does not handle API errors:

- In the Redux slice, ensure the `rejected` case stores `action.error.message` in the `error` field.
- In the component, check for `error` from the Redux selector.
- Render an error banner with `role="alert"`, a red/destructive background, and the error message.
- Include a retry mechanism: a button that re-dispatches the original thunk.

### 5. Implement Network Error State

If the component does not distinguish network errors from server errors:

- In the Redux slice async thunks, wrap the `fetch` call in a try/catch. When `fetch` throws (not a response error), set the error message to "Unable to connect. Please check your internet connection and try again."
- In the component, check if the error message contains "Unable to connect."
- Render a distinct amber-colored banner with a `WifiOff` icon and a retry button.
- This must be visually different from server errors so users know the issue is connectivity, not the application.

### 6. Implement Success State

If the component needs explicit success feedback (e.g., form submission):

- After a successful action, show a success message using a toast (`sonner`) or an inline success banner.
- For navigation-based success (e.g., redirect after login), ensure the transition is smooth and there is no flash of stale state.

### 7. Implement Offline State (Optional)

If the state matrix includes an offline state:

- Use `navigator.onLine` and the `online`/`offline` window events to detect connectivity changes.
- Show a persistent banner at the top of the page when offline.
- Disable submit buttons and show a tooltip explaining why.
- When connectivity returns, hide the banner and optionally auto-retry the last failed request.

### 8. Update the State Matrix

After implementing each state:

- Open the state matrix file.
- Update the "Implementation" column with a brief description of how it is now implemented.
- Change the "Status" column from "Not implemented" to "Done."
- If only partially implemented, change to "Partial" with a note on what remains.

## Output

| File | Action | Description |
| ---- | ------ | ----------- |
| `apps/web/features/<feature>/<feature>Slice.ts` | Modify | Add network error detection in thunks |
| `apps/web/components/<feature>/*.tsx` | Modify | Add missing state renders (loading, empty, error, network) |
| `apps/web/components/<feature>/*-error.tsx` | Create | Dedicated error state component if needed |
| `apps/web/components/<feature>/*-empty.tsx` | Create | Dedicated empty state component if needed |
| `packages/specs/<feature>-states.md` | Modify | Update status from "Not implemented" to "Done" |

## Verification

1. **Type check:** `pnpm typecheck` passes with zero errors.
2. **Lint:** `pnpm lint` passes with zero errors.
3. **Loading state:** Trigger a loading state (e.g., slow network in DevTools). Verify spinner/skeleton appears and inputs are disabled.
4. **Empty state:** Clear all data or use an empty dataset. Verify the empty UI renders with icon and message.
5. **Server error:** Force an API error (e.g., return 500 from server). Verify error banner appears with message and retry button.
6. **Network error:** Disable network in DevTools and trigger a request. Verify amber banner with WiFi icon appears. Click retry and verify it re-attempts.
7. **Success state:** Complete a successful action. Verify success feedback (toast, redirect, or inline message).
8. **State matrix updated:** Open the state matrix file and confirm every previously "Not implemented" row now says "Done."
9. **No regressions:** Verify that all previously working states (idle, loading, success) still function correctly.
10. **Accessibility:** Error banners have `role="alert"`. Retry buttons are keyboard accessible. Loading states are announced to screen readers.
