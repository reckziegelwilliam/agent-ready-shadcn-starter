# Settings Page -- Post-Implementation Review

This document captures lessons from building the settings page with an AI agent, including common mistakes and how they were corrected.

## What the AI Got Right

**Tab structure and wiring.** The agent correctly set up the shadcn `Tabs` component with three tabs, each rendering its own form component. The tab switching worked on the first pass.

**Redux slice structure.** The async thunk pattern (pending/fulfilled/rejected) was implemented correctly for all four thunks (fetch, updateProfile, updateNotifications, updateAppearance). The slice state shape matched the spec.

**Form validation.** The Zod schema for the profile form was accurate, with proper min/max constraints on name and bio fields.

**API integration.** The NestJS controller/service pattern matched the existing auth module conventions. Mock data with artificial delays worked correctly.

## Common Mistakes Caught

### 1. Missing Dirty State Tracking

**Issue:** The save button on the profile tab was always enabled, regardless of whether the user had made changes. The agent created the form with `react-hook-form` but did not use the `isDirty` flag to control the button's `disabled` state.

**Fix:** Added `isDirty` to the `formState` destructuring and used `disabled={!isDirty || isSaving}` on the save button.

**Lesson:** Dirty state tracking is not the default behavior in most AI-generated forms. The spec must explicitly call it out, and the review must verify the save button is disabled when the form is clean.

### 2. No Optimistic Update on Toggle Switches

**Issue:** The notification toggles waited for the API response before updating the UI. This created a noticeable delay (600-800ms) where the toggle appeared stuck.

**Fix:** Added `optimisticUpdateNotifications` and `optimisticUpdateAppearance` reducers to the slice. The component dispatches the optimistic update first, then dispatches the async thunk. On failure, the previous state is restored.

**Lesson:** Any toggle or switch that interacts with an API should use optimistic updates. Without explicit instructions, AI agents will wait for the API response before updating the UI.

### 3. Toast Notifications Not Cleaned Up

**Issue:** Multiple rapid saves on the profile form stacked toast notifications. The agent did not dismiss previous toasts before showing new ones, leading to a pile of "Profile updated." toasts.

**Fix:** Used sonner's built-in deduplication. Also ensured that the `saveStatus` is reset to `idle` after showing the toast, so the effect does not re-trigger.

**Lesson:** Toast lifecycle management is frequently overlooked. Specify in the prompt whether toasts should stack, replace, or deduplicate.

### 4. Theme Change Not Persisted

**Issue:** The agent applied theme changes immediately using `next-themes` but did not persist the selection back to the API. On page reload, the theme reverted to the server-stored value.

**Fix:** Wired the `handleThemeChange` callback to both apply the theme locally and dispatch the `updateAppearance` thunk to persist it.

**Lesson:** AI agents treat "apply immediately" as the complete requirement. They do not infer that persistence is also needed. The spec must explicitly state both.

### 5. Form Doesn't Reset After Save

**Issue:** After a successful profile save, the form's `isDirty` flag remained `true` because the form's default values were not updated. The save button stayed enabled even though the saved values matched the form values.

**Fix:** Called `form.reset({ name: settings.profile.name, bio: settings.profile.bio })` in the `useEffect` that detects `saveStatus === 'succeeded'`. This updates the form's baseline values so `isDirty` correctly becomes `false`.

**Lesson:** `form.reset()` with new default values is the canonical way to clear dirty state after a save in `react-hook-form`. AI agents often skip this step.

### 6. Missing Loading Skeleton for Initial Fetch

**Issue:** The agent rendered the forms immediately with empty/default values while the `GET /settings` call was in flight. This caused a flash of empty content followed by a repaint when data arrived.

**Fix:** Added a `SettingsSkeleton` component that renders `Skeleton` placeholders matching the form layout. The page renders skeletons when `status === 'loading'` and forms when `status === 'succeeded'`.

**Lesson:** Loading skeletons prevent layout shift and give users confidence that content is loading. AI agents will only add skeletons if the spec or prompt explicitly requires them.

## Acceptance Criteria Results

| AC   | Description                                    | Status |
| ---- | ---------------------------------------------- | ------ |
| AC-1 | Settings page loads and shows skeleton         | Pass (after fix #6) |
| AC-2 | Profile tab displays populated fields          | Pass |
| AC-3 | Save button disabled when clean, enabled dirty | Pass (after fix #1) |
| AC-4 | Save shows spinner and disables fields         | Pass |
| AC-5 | Save success shows toast and resets dirty       | Pass (after fix #5) |
| AC-6 | Save error shows inline banner                 | Pass |
| AC-7 | Notification toggles auto-save optimistically  | Pass (after fix #2) |
| AC-8 | Notification save failure reverts toggle        | Pass |
| AC-9 | Theme select applies immediately               | Pass |
| AC-10| Font size select updates immediately           | Pass |
| AC-11| Appearance save failure reverts                | Pass |
| AC-12| All elements keyboard accessible               | Pass |
| AC-13| Responsive 320px to 1440px                     | Pass |

## Key Takeaways

1. **Dirty state tracking requires explicit implementation.** AI agents do not add it unless the spec demands it. Always verify the save button is disabled when the form has no changes.
2. **Optimistic updates are not the default.** Without explicit instructions, toggles and selects will wait for the API response. This makes the UI feel sluggish.
3. **Toast management is error-prone.** AI agents fire toasts without considering stacking, deduplication, or cleanup. The effect that triggers the toast must also reset the status that triggered it.
4. **"Apply immediately" does not imply "persist."** If a change should both apply locally and save to the server, both actions must be specified.
5. **Form reset after save is a distinct step.** Saving data does not automatically update react-hook-form's baseline values. `form.reset()` with the new values must be called explicitly.
6. **Skeleton loading states prevent layout shift.** They must be specified and shaped to match the actual content layout.
