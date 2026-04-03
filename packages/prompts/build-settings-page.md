# Build Settings Page

> Target spec: `packages/specs/settings-page.md`
> Difficulty: Medium

## Context

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **State management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Forms:** `react-hook-form` v7 with `@hookform/resolvers` and `zod` v3
- **UI components:** Imported from `@workspace/ui/components/` (shadcn/ui primitives)
- **Toasts:** `sonner` (import `{ toast }` from `"sonner"`)
- **Routing:** Next.js App Router file-based routing
- **Feature directory:** `apps/web/features/settings/` for the Redux slice
- **Components directory:** `apps/web/components/settings/` for UI components
- **Page directory:** `apps/web/app/settings/` for the route

## Input

1. Read the full spec: `packages/specs/settings-page.md`
2. Read the state matrix: `packages/specs/settings-page-states.md`
3. Review the auth slice for conventions: `apps/web/features/auth/authSlice.ts`
4. Review the login form for component patterns: `apps/web/components/auth/login-form.tsx`
5. Check the Redux store: `apps/web/lib/store/store.ts`
6. Review the auth API module: `apps/api/src/auth/` (controller, service, module pattern)

## Instructions

### 1. Build the NestJS API Module

Create the settings API with in-memory mock data.

- **Directory:** `apps/api/src/settings/`
- Create `settings.service.ts` with an in-memory settings object. Include a `delay()` helper (600-800ms random) to simulate network latency.
- Create `settings.controller.ts` with four endpoints:
  - `GET /settings` -- returns the full settings object
  - `PATCH /settings/profile` -- updates name and bio, returns full settings
  - `PATCH /settings/notifications` -- updates notification booleans, returns full settings
  - `PATCH /settings/appearance` -- updates theme and fontSize, returns full settings
- Create `settings.module.ts` registering the controller and service.
- Register `SettingsModule` in `apps/api/src/app.module.ts`.

### 2. Build the Redux Slice

Create the settings slice with four async thunks.

- **File:** `apps/web/features/settings/settingsSlice.ts`
- State shape: `{ settings: Settings | null, status, saveStatus, error }`
- Async thunks: `fetchSettings`, `updateProfile`, `updateNotifications`, `updateAppearance`
- Synchronous actions:
  - `clearSettingsError` -- resets error and saveStatus
  - `resetSaveStatus` -- sets saveStatus to idle
  - `optimisticUpdateNotifications` -- directly sets notifications in state
  - `optimisticUpdateAppearance` -- directly sets appearance in state
- Follow the pending/fulfilled/rejected pattern from the auth slice.
- **IMPORTANT:** `updateNotifications` and `updateAppearance` fulfilled handlers should set `saveStatus` to `'idle'` (not `'succeeded'`), since the UI does not show a success state for these.

### 3. Register the Slice

Add `settingsReducer` to the Redux store.

- **File:** `apps/web/lib/store/store.ts`
- Import `settingsReducer` from `@/features/settings/settingsSlice`
- Add it under the `settings` key in the reducer map.
- **Do not remove existing reducers.**

### 4. Build the Settings Layout

- **File:** `apps/web/components/settings/settings-layout.tsx`
- Server component (no "use client" needed).
- Renders a title ("Settings"), description, and a `Separator` above `{children}`.
- Max width container with responsive padding.

### 5. Build the Profile Form

- **File:** `apps/web/components/settings/profile-form.tsx`
- **Must include** `"use client"` at the top.
- Uses `react-hook-form` with `zodResolver` for name (required, max 100) and bio (optional, max 500).
- Email field is rendered as a disabled, read-only `Input` with muted background.
- **Dirty state tracking:** Destructure `isDirty` from `formState`. Disable the save button when `!isDirty || isSaving`.
- **Save success flow:** In a `useEffect`, watch for `saveStatus === 'succeeded'`. When detected, call `toast.success("Profile updated.")`, call `form.reset()` with the new values from Redux state, and dispatch `resetSaveStatus()`.
- **Save error flow:** Render an inline error banner above the form when `saveStatus === 'failed'`.

### 6. Build the Notifications Form

- **File:** `apps/web/components/settings/notifications-form.tsx`
- **Must include** `"use client"` at the top.
- Renders three toggle rows (email notifications, push notifications, marketing emails).
- Use the shadcn `Checkbox` component styled as a toggle switch.
- **Optimistic update pattern:**
  1. Save the current notification state as `previousNotifications`.
  2. Dispatch `optimisticUpdateNotifications` with the new state.
  3. Dispatch `updateNotifications` thunk.
  4. In the `.catch()` of `dispatch(...).unwrap()`, dispatch `optimisticUpdateNotifications` with `previousNotifications` to rollback, and call `toast.error(...)`.

### 7. Build the Appearance Form

- **File:** `apps/web/components/settings/appearance-form.tsx`
- **Must include** `"use client"` at the top.
- Renders a theme `Select` (light/dark/system) and a font size `Select` (small/default/large).
- On change, apply the value immediately to the DOM (data attributes or class names) AND dispatch the optimistic update + async thunk.
- On failure, rollback both DOM and Redux state.

### 8. Build the Settings Page

- **File:** `apps/web/app/settings/page.tsx`
- **Must include** `"use client"` at the top.
- Dispatches `fetchSettings` on mount via `useEffect`.
- Renders `SettingsLayout` as wrapper.
- Uses shadcn `Tabs` with three tabs: Profile, Notifications, Appearance.
- Shows skeleton loading state when `status === 'loading'`.
- Shows error state with retry button when `status === 'failed'`.
- Each `TabsContent` renders its respective form component.

### 9. Write Tests

- **File:** `apps/web/features/settings/__tests__/settingsSlice.test.ts`
- Test initial state.
- Test `clearSettingsError` and `resetSaveStatus` reducers.
- Test `optimisticUpdateNotifications` and `optimisticUpdateAppearance` reducers.
- Test `fetchSettings` pending/fulfilled/rejected.
- Test `updateProfile` pending/fulfilled/rejected.
- Test `updateNotifications` pending/fulfilled/rejected.
- Test `updateAppearance` pending/fulfilled/rejected.

## Output

| File | Action | Description |
|------|--------|-------------|
| `apps/api/src/settings/settings.service.ts` | Create | In-memory settings store with delay |
| `apps/api/src/settings/settings.controller.ts` | Create | GET + 3 PATCH endpoints |
| `apps/api/src/settings/settings.module.ts` | Create | NestJS module |
| `apps/api/src/app.module.ts` | Modify | Register SettingsModule |
| `apps/web/features/settings/settingsSlice.ts` | Create | Redux slice with 4 thunks |
| `apps/web/lib/store/store.ts` | Modify | Add settings reducer |
| `apps/web/components/settings/settings-layout.tsx` | Create | Page layout wrapper |
| `apps/web/components/settings/profile-form.tsx` | Create | Profile form with dirty tracking |
| `apps/web/components/settings/notifications-form.tsx` | Create | Toggles with optimistic update |
| `apps/web/components/settings/appearance-form.tsx` | Create | Theme and font size selects |
| `apps/web/app/settings/page.tsx` | Create | Settings page with tabs |
| `apps/web/features/settings/__tests__/settingsSlice.test.ts` | Create | Slice unit tests |

## Verification

1. **Type check:** `pnpm typecheck` passes with zero errors.
2. **Lint:** `pnpm lint` passes with zero errors.
3. **Tests:** `pnpm test` passes all settings slice tests.
4. **Visual -- Profile:** Navigate to `/settings`. Change name. Verify save button enables. Save. Verify toast and button disables.
5. **Visual -- Notifications:** Toggle a switch. Verify it updates immediately. Verify no visible loading delay.
6. **Visual -- Appearance:** Change theme. Verify the page theme updates immediately.
7. **Loading state:** Refresh the page. Verify skeleton placeholders appear before content loads.
8. **Error handling:** Stop the API server. Try to save profile. Verify inline error appears. Toggle a notification switch. Verify it reverts and shows error toast.
9. **Spec coverage:** Compare output against every acceptance criterion in `packages/specs/settings-page.md`.
