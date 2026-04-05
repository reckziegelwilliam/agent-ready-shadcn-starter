# Optimistic CRUD -- Post-Implementation Review

This document captures lessons from building the optimistic CRUD task list with an AI agent, including common mistakes and how they were corrected.

## What the AI Got Right

**Table structure and component composition.** The agent correctly set up the shadcn Table with TaskItem rows, each receiving callbacks for toggle, edit, and delete. Component separation was clean on the first pass.

**Redux slice structure.** The async thunk pattern (pending/fulfilled/rejected) was implemented correctly for all four thunks (fetch, create, update, delete). The slice state shape matched the spec.

**Form validation.** The Zod schema for the task form was accurate, with proper constraints on title (required, max 100) and description (optional, max 500). Priority used `z.enum` correctly.

**API integration.** The NestJS controller/service pattern matched the existing auth and settings module conventions. Mock data with artificial delays and 10% random failure rate worked correctly.

## Common Mistakes Caught

### 1. No Optimistic Update (Waited for Server Response)

**Issue:** The agent waited for the API response before updating the UI. Creating a task showed a loading spinner in the dialog for 500-800ms before the task appeared in the table. This is the single most common mistake.

**Fix:** Split the pattern into synchronous optimistic reducers (`optimisticAddTask`, `optimisticUpdateTask`, `optimisticDeleteTask`) dispatched before the async thunk. The component dispatches the optimistic action first, then dispatches the thunk and handles rollback in `.catch()`.

**Lesson:** AI agents default to the standard async thunk pattern where UI updates happen in `fulfilled`. The spec and prompt must explicitly require optimistic updates with separate synchronous reducers.

### 2. No Rollback on Failure (UI Stuck in Wrong State)

**Issue:** When the API returned a 500 error, the optimistic change persisted. A deleted task stayed deleted. An edited task kept the wrong values. The agent implemented `rejected` handlers but they were empty.

**Fix:** Added rollback reducers (`rollbackAddTask`, `rollbackUpdateTask`, `rollbackDeleteTask`) and dispatched them from the component's `.catch()` block using the stored previous state.

**Lesson:** Rollback requires storing the previous state before the optimistic update. The component must store `previousTask = { ...task }` before dispatching the optimistic action. AI agents skip this step because it is a second concern layered on top of the mutation flow.

### 3. Delete Without Confirmation Dialog

**Issue:** The agent dispatched the delete thunk directly from the delete button's `onClick` handler. Clicking delete immediately removed the task with no way back (besides the rollback on API failure, which is not the same as user confirmation).

**Fix:** Added `DeleteConfirmDialog` component. The delete button sets `deletingTask` state, which opens the confirmation dialog. Only the dialog's "Delete" button dispatches the actual delete.

**Lesson:** Destructive actions need confirmation dialogs. AI agents will skip them unless the spec explicitly requires them. The confirmation dialog is separate from the rollback mechanism.

### 4. No Loading Indicator During Initial Fetch

**Issue:** The page rendered an empty state immediately, then flashed to the task list after the API responded. This was jarring and briefly showed "No tasks yet" to users who had tasks.

**Fix:** Added `TaskListLoading` skeleton component that renders when `status === 'loading'`. The page shows skeletons during the initial fetch, then transitions to the loaded list or empty state.

**Lesson:** Skeleton loading states prevent false empty states and layout shift. The agent only adds them when explicitly required in the spec.

### 5. Missing Empty State

**Issue:** When there were no tasks, the page showed an empty table with headers but no body rows. No message, no CTA to create a task.

**Fix:** Added `TaskListEmpty` component that renders when `status === 'succeeded'` and `tasks.length === 0`. It shows an icon, a message, and a "Create your first task" button that opens the create dialog.

**Lesson:** Empty states are a distinct UI concern. The agent builds the table and the loading state but does not consider what happens when the data set is empty.

### 6. Toast Notifications Not Showing on Rollback

**Issue:** The agent added `toast.success()` on create/edit/delete success but did not add `toast.error()` on rollback. When the API failed and the UI rolled back, the user had no feedback about what happened.

**Fix:** Added `toast.error()` calls in every `.catch()` block alongside the rollback dispatch. The error message comes from the rejected value or a generic fallback.

**Lesson:** Toast notifications must cover both success and failure paths. AI agents handle the happy path first and often skip the error path for toasts, even when the rollback logic itself is correct.

## Acceptance Criteria Results

| AC   | Description                                     | Status |
| ---- | ----------------------------------------------- | ------ |
| AC-1 | Task list loads with skeleton                   | Pass (after fix #4) |
| AC-2 | Tasks display in table with checkbox, badge, actions | Pass |
| AC-3 | Empty state with CTA                           | Pass (after fix #5) |
| AC-4 | Add Task dialog with validated form             | Pass |
| AC-5 | Create adds task immediately (optimistic)       | Pass (after fix #1) |
| AC-6 | Create rollback removes task + error toast      | Pass (after fix #2, #6) |
| AC-7 | Edit updates table row immediately              | Pass (after fix #1) |
| AC-8 | Edit rollback reverts + error toast             | Pass (after fix #2, #6) |
| AC-9 | Delete shows confirmation dialog                | Pass (after fix #3) |
| AC-10| Delete removes task immediately                 | Pass (after fix #1) |
| AC-11| Delete rollback restores task + error toast     | Pass (after fix #2, #6) |
| AC-12| Toggle checkbox updates + rollback              | Pass (after fix #1, #2) |
| AC-13| All rollbacks show toast notifications          | Pass (after fix #6) |
| AC-14| Error state with retry button on fetch failure  | Pass |
| AC-15| Keyboard accessible with proper labels          | Pass |

## Key Takeaways

1. **Optimistic updates are not the default pattern.** AI agents use the standard pending/fulfilled/rejected flow where the UI waits for the server. Optimistic requires explicit synchronous reducers dispatched before the async thunk.
2. **Rollback requires previous state storage.** The component must snapshot the current state before dispatching the optimistic update. Without this, there is nothing to roll back to.
3. **Confirmation dialogs are a separate requirement.** They are not implied by "delete." The spec must explicitly require them.
4. **Loading skeletons prevent false empty states.** Without them, the page briefly shows "no data" before the fetch completes.
5. **Empty states are a distinct concern.** An empty table is not the same as a meaningful empty state with a CTA.
6. **Toast coverage must include failures.** Success toasts are easy. Error toasts on rollback are frequently skipped.
