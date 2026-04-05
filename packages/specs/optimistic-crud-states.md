# State Matrix: Optimistic CRUD -- Task List

> Documents every user-facing state across the task list feature. States marked "Not implemented" are known gaps.

## Task List (Global)

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Loading** | Initial GET /tasks in flight | Skeleton rows matching table layout | `status === 'loading'` in tasksSlice | Done |
| **Loaded** | Tasks fetched successfully | Table with task rows, action buttons | `status === 'succeeded'`, tasks populated | Done |
| **Empty** | Tasks fetched, array is empty | Illustration, message, "Create your first task" button | `status === 'succeeded'` and `tasks.length === 0` | Done |
| **Error (fetch)** | GET /tasks failed | Error message with description and retry button | `status === 'failed'`, error displayed | Done |
| **Error (network)** | No connectivity / API unreachable | Generic error from thunk rejection | No offline detection | Not implemented |
| **Stale data** | Tasks changed on another device | No real-time sync | Would need WebSocket or polling | Not implemented |

## Create Task

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Dialog closed** | Default state | No dialog visible | `createDialogOpen === false` (local state) | Done |
| **Dialog open** | User clicked "Add Task" | Dialog with empty title, description, priority fields | `createDialogOpen === true` | Done |
| **Validating** | User submitted invalid form | Inline errors under invalid fields | react-hook-form + zod validation | Done |
| **Creating (optimistic)** | Form submitted, POST in flight | Dialog closes, task appears in table with temp ID | `createTask.pending` adds task to array | Done |
| **Create success** | POST returned 201 | Task in table (temp ID replaced with real ID) | `createTask.fulfilled` replaces temp task | Done |
| **Create rollback** | POST failed (500 or network) | Task removed from table, error toast | `createTask.rejected` removes temp task, toast.error() | Done |
| **Rapid creation** | User creates multiple tasks quickly | Each appears in table as submitted | Independent thunks, each with own temp ID | Done |
| **Rate limited** | Too many creates | No handling | Not implemented | Not implemented |

## Edit Task

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Dialog closed** | Default state | No edit dialog visible | `editingTask === null` (local state) | Done |
| **Dialog open** | User clicked edit on a task | Dialog with pre-filled fields | `editingTask` set to task object | Done |
| **Validating** | User submitted invalid form | Inline errors under invalid fields | react-hook-form + zod validation | Done |
| **Editing (optimistic)** | Form submitted, PATCH in flight | Dialog closes, table row updates immediately | `updateTask.pending` applies changes to task | Done |
| **Edit success** | PATCH returned 200 | Task shows updated values | `updateTask.fulfilled` confirms from server | Done |
| **Edit rollback** | PATCH failed (500 or network) | Task reverts to previous values, error toast | `updateTask.rejected` restores previous task, toast.error() | Done |
| **Concurrent edit** | Two users editing same task | No conflict detection | Would need ETag or version field | Not implemented |

## Delete Task

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Idle** | Default state | No confirmation dialog | `deletingTask === null` (local state) | Done |
| **Confirm dialog open** | User clicked delete button | Confirmation dialog showing task title | `deletingTask` set to task object | Done |
| **Deleting (optimistic)** | User confirmed delete, DELETE in flight | Dialog closes, task removed from table | `deleteTask.pending` removes task from array | Done |
| **Delete success** | DELETE returned 200 | Task stays removed | `deleteTask.fulfilled` -- no further action | Done |
| **Delete rollback** | DELETE failed (500 or network) | Task reappears in table, error toast | `deleteTask.rejected` re-inserts task, toast.error() | Done |
| **Delete without confirm** | No confirmation dialog | N/A -- always confirm | Confirmation dialog required before dispatch | Done |

## Toggle Complete

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Idle** | Checkbox reflects current completed state | Checked or unchecked | Bound to `task.completed` | Done |
| **Toggling (optimistic)** | User clicked checkbox, PATCH in flight | Checkbox toggles immediately | `updateTask.pending` flips `completed` | Done |
| **Toggle success** | PATCH returned 200 | Checkbox stays in new state | `updateTask.fulfilled` confirms | Done |
| **Toggle rollback** | PATCH failed | Checkbox reverts, error toast | `updateTask.rejected` restores, toast.error() | Done |
| **Rapid toggling** | User toggles same task quickly | Last toggle wins | Each dispatch overwrites pending state | Partial |

## Gap Summary

| Gap | States Affected | Priority | Notes |
|-----|----------------|----------|-------|
| Offline/network error detection | All mutations | Medium | Need navigator.onLine or fetch error type detection |
| Rate limiting | Create, Edit | Low | Requires API-side implementation first |
| Concurrent edit / conflict detection | Edit | Low | Would need ETag or version field |
| Real-time sync (stale data) | All | Low | Would need WebSocket or polling |
| Undo on delete | Delete | Medium | Could add undo button in toast, delay actual DELETE |
| Rapid toggle debouncing | Toggle | Low | Could debounce checkbox to prevent excessive API calls |

## AI Agent Observations

When generating this optimistic CRUD feature, AI agents consistently:
1. Implemented fetch and display correctly on the first pass
2. Created forms with proper validation (react-hook-form + zod)
3. Did NOT implement optimistic updates -- waited for API response before updating UI
4. Did NOT implement rollback on failure -- UI stayed in wrong state after API error
5. Skipped the confirmation dialog for delete -- deleted immediately on button click
6. Forgot loading skeleton for the initial fetch -- showed empty state briefly before data loaded
7. Did not show empty state when task list was empty
8. Fired toast on success but not on rollback/failure
