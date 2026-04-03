# Settings Page Example

> Status: Implemented

## Overview

A multi-tab settings page with Profile, Notifications, and Appearance tabs. Demonstrates dirty state tracking, optimistic updates with rollback, auto-save on toggle, and immediate theme/font-size application.

## How to Run

```bash
# From the monorepo root
pnpm dev

# Visit http://localhost:3000/settings
# API runs at http://localhost:4000
```

## Key Patterns

### 1. Dirty State Tracking (Profile Tab)
The profile form uses `react-hook-form`'s `isDirty` to enable/disable the save button. The button is only clickable when the user has made changes. After a successful save, `form.reset()` is called with the new values from the API response to clear the dirty flag.

### 2. Optimistic Updates with Rollback (Notifications Tab)
Notification toggles update the Redux store immediately via `optimisticUpdateNotifications` before the API call completes. If the API call fails, the previous state is restored and an error toast is shown.

### 3. Auto-Save on Change (Notifications & Appearance Tabs)
Both tabs dispatch their update thunks immediately when the user changes a value. There is no explicit save button.

### 4. Immediate Application (Appearance Tab)
Theme and font size changes are applied to the DOM immediately via data attributes. The API call happens in the background. On failure, the DOM change is reverted along with the Redux state.

### 5. Skeleton Loading State
The settings page shows skeleton placeholders while the initial `GET /settings` call is in flight, preventing layout shift when data arrives.

### 6. Independent Save Operations
Each tab saves independently to its own API endpoint. A failure in one tab does not affect the others.

## File Listing

| File | Description |
|------|-------------|
| `packages/specs/settings-page.md` | Feature specification |
| `packages/specs/settings-page-states.md` | Full state matrix |
| `apps/api/src/settings/settings.module.ts` | NestJS module registration |
| `apps/api/src/settings/settings.controller.ts` | API route handlers |
| `apps/api/src/settings/settings.service.ts` | In-memory mock data store |
| `apps/web/features/settings/settingsSlice.ts` | Redux slice with async thunks |
| `apps/web/components/settings/settings-layout.tsx` | Page layout wrapper |
| `apps/web/components/settings/profile-form.tsx` | Profile form with dirty tracking |
| `apps/web/components/settings/notifications-form.tsx` | Toggle switches with optimistic update |
| `apps/web/components/settings/appearance-form.tsx` | Theme and font size selects |
| `apps/web/app/settings/page.tsx` | Next.js page with tabs |
| `apps/web/features/settings/__tests__/settingsSlice.test.ts` | Redux slice unit tests |
| `packages/prompts/build-settings-page.md` | AI build prompt |

## Related Specs

- `packages/specs/settings-page.md`
- `packages/specs/settings-page-states.md`
