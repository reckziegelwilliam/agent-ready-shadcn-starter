# State Matrix: Settings Page

> Documents every user-facing state across the settings page tabs. States marked "Not implemented" are known gaps.

## Tabs

### Settings Page (Global)

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Loading** | Initial GET /settings in flight | Skeleton placeholders for all fields | `status === 'loading'` in settingsSlice | Done |
| **Loaded** | Settings fetched successfully | Populated forms, tabs interactive | `status === 'succeeded'`, settings populated | Done |
| **Error (fetch)** | GET /settings failed | Error message with description | `status === 'failed'`, error displayed | Done |
| **Error (network)** | No connectivity / API unreachable | Generic error from thunk rejection | No offline detection | Not implemented |
| **Stale data** | Settings changed on another device | No real-time sync | Would need WebSocket or polling | Not implemented |

### Profile Tab (`/settings` default)

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Idle** | Form loaded, no user changes | Name and bio populated, email read-only, save button disabled | `isDirty === false` from react-hook-form | Done |
| **Dirty** | User modified name or bio | Save button enabled | `isDirty === true` from react-hook-form | Done |
| **Validating** | User blurred field with invalid input | Inline error below field | Zod schema + react-hook-form `mode: "onBlur"` | Done |
| **Saving** | PATCH /settings/profile in flight | Spinner on save button, fields disabled | `saveStatus === 'saving'` | Done |
| **Save success** | PATCH returned 200 | Toast "Profile updated.", save button re-disables, form resets dirty | `saveStatus === 'succeeded'`, toast via sonner, form.reset() | Done |
| **Save error** | PATCH returned 4xx/5xx | Inline error banner above form, fields re-enabled, dirty state preserved | `saveStatus === 'failed'`, error from action payload | Done |
| **Save error (network)** | No connectivity during save | Generic error message | Caught by thunk rejection, no offline detection | Not implemented |
| **Concurrent edit** | Another session changed profile | No conflict detection | Would need ETag or version field | Not implemented |
| **Rate limited** | Too many save attempts | No handling | Neither API nor UI implements rate limiting | Not implemented |
| **Stale after save** | Save succeeds but response differs from local | Form updates from response | Settings replaced from API response | Done |

### Notifications Tab

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Idle** | Toggles loaded from settings | Toggles reflect current preferences | Checkboxes bound to Redux state | Done |
| **Saving (optimistic)** | User toggled a switch, PATCH in flight | Toggle already shows new value | Optimistic dispatch before API call | Done |
| **Save success** | PATCH returned 200 | No visible change (toggle already correct) | State confirmed from API response | Done |
| **Save error (rollback)** | PATCH failed | Toggle reverts to previous value, error toast shown | Rollback via rejected handler, toast via sonner | Done |
| **Save error (network)** | No connectivity during toggle | Generic rollback and error toast | Caught by thunk rejection | Partial |
| **Multiple rapid toggles** | User toggles multiple switches quickly | Each toggle triggers independent save | Each toggle dispatches its own thunk | Done |
| **Partial failure** | One toggle save fails, others succeed | Failed toggle reverts, others stay | Independent thunk per toggle change | Done |
| **Rate limited** | Too many toggle changes | No handling | Not implemented | Not implemented |
| **Stale state** | Toggles out of sync with server | No sync mechanism | Would need polling or WebSocket | Not implemented |

### Appearance Tab

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Idle** | Selects loaded from settings | Theme and font size reflect current preferences | Select values bound to Redux state | Done |
| **Saving** | User changed a select, PATCH in flight | Change applied immediately (optimistic) | Optimistic dispatch, theme applied via next-themes | Done |
| **Save success** | PATCH returned 200 | No visible change | State confirmed from API response | Done |
| **Save error (rollback)** | PATCH failed | Select reverts to previous value, error toast | Rollback in rejected handler | Done |
| **Theme applied** | Theme select changed | Page theme updates immediately | `useTheme().setTheme()` called on change | Done |
| **Font size applied** | Font size select changed | Text size updates across page | CSS class applied to document | Done |
| **System theme change** | OS theme changes while "system" selected | Page theme follows OS change | Handled by next-themes internally | Done |
| **Save error (network)** | No connectivity during save | Revert and error toast | Caught by thunk rejection | Partial |
| **Rate limited** | Too many changes | No handling | Not implemented | Not implemented |

## Gap Summary

| Gap | Tabs Affected | Priority | Notes |
|-----|--------------|----------|-------|
| Offline/network error handling | All 3 | Medium | Need navigator.onLine check or fetch error type detection |
| Rate limiting | All 3 | Low | Requires API-side implementation first |
| Concurrent edit / conflict detection | Profile | Low | Would need ETag or version field |
| Real-time sync (stale data) | All 3 | Low | Would need WebSocket or polling |
| Unsaved changes warning on tab switch | Profile | Medium | Could use beforeunload or tab change intercept |

## AI Agent Observations

When generating this settings page, AI agents consistently:
1. Implemented the happy-path states correctly for all three tabs
2. Handled profile form validation well (Zod integration with react-hook-form)
3. Missed dirty state tracking -- save button was always enabled
4. Did not implement optimistic updates for notification toggles (waited for API response)
5. Forgot to reset form dirty state after successful profile save
6. Did not handle rollback on notification/appearance save failure
7. Applied theme changes but did not persist the selection to the API
8. Generated toast notifications but did not differentiate between success and error toasts
