# Optimistic CRUD Example

> Status: Complete

## What This Covers

A CRUD task list with optimistic updates that provides instant UI feedback while syncing with the server in the background. All mutations (create, edit, delete, toggle complete) update the UI immediately and roll back on failure.

## Operations

- **Create:** Opens a dialog form. Task appears in the table immediately with a temporary ID. On success, the temporary ID is replaced with the server-generated ID. On failure, the task is removed and an error toast appears.
- **Edit:** Opens a dialog pre-filled with the current task. Changes apply to the table immediately. On failure, the row reverts to its previous values.
- **Delete:** Opens a confirmation dialog. On confirm, the task is removed immediately. On failure, the task reappears.
- **Toggle complete:** Checkbox toggles immediately. On failure, it reverts.

## Key Patterns Demonstrated

- **Optimistic state updates in Redux:** Synchronous reducers (`optimisticAddTask`, `optimisticUpdateTask`, `optimisticDeleteTask`) apply changes immediately. Async thunks handle the API call. On rejection, rollback reducers (`rollbackAddTask`, `rollbackUpdateTask`, `rollbackDeleteTask`) restore the previous state.
- **Temporary IDs:** New tasks get a `temp-{nanoid}` ID. The `createTask.fulfilled` handler replaces the temp task with the server response.
- **Previous state storage:** Components store the previous task state before dispatching optimistic updates, then pass it to rollback reducers on failure.
- **Toast-based error feedback:** Every rollback shows a `toast.error()` via sonner.
- **Confirmation dialogs:** Destructive actions (delete) require explicit user confirmation before dispatching.

## File Map

| File | Purpose |
|------|---------|
| `packages/specs/optimistic-crud.md` | Feature specification |
| `packages/specs/optimistic-crud-states.md` | Full state matrix |
| `apps/api/src/tasks/tasks.module.ts` | NestJS module |
| `apps/api/src/tasks/tasks.controller.ts` | REST controller (GET, POST, PATCH, DELETE) |
| `apps/api/src/tasks/tasks.service.ts` | In-memory service with random failures |
| `apps/web/features/tasks/tasksSlice.ts` | Redux slice with optimistic + rollback reducers |
| `apps/web/components/tasks/task-list.tsx` | Main task list component |
| `apps/web/components/tasks/task-item.tsx` | Single task row |
| `apps/web/components/tasks/task-form-dialog.tsx` | Create/edit dialog form |
| `apps/web/components/tasks/delete-confirm-dialog.tsx` | Delete confirmation dialog |
| `apps/web/components/tasks/task-list-loading.tsx` | Skeleton loading state |
| `apps/web/components/tasks/task-list-empty.tsx` | Empty state |
| `apps/web/app/items/page.tsx` | Next.js page route |
| `apps/web/features/tasks/__tests__/tasksSlice.test.ts` | Slice unit tests |

## Running

1. Start the API: `cd apps/api && pnpm dev` (runs on port 4000)
2. Start the web app: `cd apps/web && pnpm dev`
3. Navigate to `/items`
4. The API has a 10% random failure rate on mutations to demonstrate rollback behavior.

## Related

- Spec: `packages/specs/optimistic-crud.md`
- State matrix: `packages/specs/optimistic-crud-states.md`
- Prompt: `packages/prompts/build-optimistic-crud.md`
- Review: `examples/optimistic-crud/review.md`
