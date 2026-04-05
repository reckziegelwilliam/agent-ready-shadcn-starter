# Build Optimistic CRUD -- Task List

> Target spec: `packages/specs/optimistic-crud.md`
> Difficulty: High

## Context

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **State management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Forms:** `react-hook-form` v7 with `@hookform/resolvers` and `zod` v3
- **UI components:** Imported from `@workspace/ui/components/` (shadcn/ui primitives)
- **Toasts:** `sonner` (import `{ toast }` from `"sonner"`)
- **Routing:** Next.js App Router file-based routing
- **Feature directory:** `apps/web/features/tasks/` for the Redux slice
- **Components directory:** `apps/web/components/tasks/` for UI components
- **Page directory:** `apps/web/app/items/` for the route

## Input

1. Read the full spec: `packages/specs/optimistic-crud.md`
2. Read the state matrix: `packages/specs/optimistic-crud-states.md`
3. Review the auth slice for conventions: `apps/web/features/auth/authSlice.ts`
4. Review the login form for component patterns: `apps/web/components/auth/login-form.tsx`
5. Check the Redux store: `apps/web/lib/store/store.ts`
6. Review the auth API module: `apps/api/src/auth/` (controller, service, module pattern)

## Instructions

### 1. Build the NestJS API Module

Create the tasks API with in-memory mock data.

- **Directory:** `apps/api/src/tasks/`
- Create `tasks.service.ts` with an in-memory array of 5 mock tasks. Include a `randomDelay()` helper (500-800ms) and a `maybeFailMutation()` helper that throws `InternalServerErrorException` 10% of the time on mutations.
- Create `tasks.controller.ts` with four endpoints:
  - `GET /tasks` -- returns all tasks
  - `POST /tasks` -- creates a task, returns it with generated id and createdAt
  - `PATCH /tasks/:id` -- updates task fields, returns updated task
  - `DELETE /tasks/:id` -- deletes task, returns `{ message: string }`
- Create `tasks.module.ts` registering the controller and service.
- Register `TasksModule` in `apps/api/src/app.module.ts`. **Do not remove existing modules.**

### 2. Build the Redux Slice

Create the tasks slice with async thunks AND optimistic reducers.

- **File:** `apps/web/features/tasks/tasksSlice.ts`
- State shape: `{ tasks: Task[], status: 'idle' | 'loading' | 'succeeded' | 'failed', error: string | null }`
- Async thunks: `fetchTasks`, `createTask`, `updateTask`, `deleteTask`
- **CRITICAL -- Synchronous optimistic reducers:** These are dispatched by the component BEFORE the async thunk. They apply changes to the UI immediately.
  - `optimisticAddTask(state, action: PayloadAction<Task>)` -- prepends a task with a temporary ID
  - `optimisticUpdateTask(state, action: PayloadAction<{ id: string; changes: Partial<Task> }>)` -- applies changes to a task
  - `optimisticDeleteTask(state, action: PayloadAction<string>)` -- removes a task by ID
- **CRITICAL -- Rollback reducers:** These are dispatched by the component in `.catch()` when the thunk fails.
  - `rollbackAddTask(state, action: PayloadAction<string>)` -- removes a task by temp ID
  - `rollbackUpdateTask(state, action: PayloadAction<Task>)` -- replaces a task with its previous version
  - `rollbackDeleteTask(state, action: PayloadAction<Task>)` -- re-inserts a previously deleted task
- The `createTask.fulfilled` handler should replace the temp task with the server-generated task.
- The `updateTask.fulfilled` handler should confirm the server state.
- The `deleteTask.fulfilled` handler does nothing (already removed optimistically).
- **Do NOT put optimistic logic in `pending` handlers.** The optimistic reducers are separate synchronous actions dispatched by the component.

### 3. Register the Slice

Add `tasksReducer` to the Redux store.

- **File:** `apps/web/lib/store/store.ts`
- Import `tasksReducer` from `@/features/tasks/tasksSlice`
- Add it under the `tasks` key in the reducer map.
- **Do not remove existing reducers.**

### 4. Build the Task List Loading Skeleton

- **File:** `apps/web/components/tasks/task-list-loading.tsx`
- Server component (no "use client" needed -- only uses Skeleton + Table).
- Renders a Table with skeleton rows matching the real table layout: checkbox, title, priority badge, action buttons.
- 5 skeleton rows.

### 5. Build the Empty State

- **File:** `apps/web/components/tasks/task-list-empty.tsx`
- **Must include** `"use client"` at the top.
- Icon (e.g., `ClipboardList` from lucide-react), heading, description, and a Button that triggers create.
- Accepts `onCreateClick` callback prop.

### 6. Build the Delete Confirmation Dialog

- **File:** `apps/web/components/tasks/delete-confirm-dialog.tsx`
- **Must include** `"use client"` at the top.
- Uses shadcn `Dialog` from `@workspace/ui/components/dialog`.
- Props: `open`, `onOpenChange`, `taskTitle`, `onConfirm`.
- Shows the task title in the description.
- Footer with Cancel and Delete (destructive variant) buttons.
- **IMPORTANT:** Cancel calls `onOpenChange(false)`. Delete calls `onConfirm`.

### 7. Build the Task Form Dialog

- **File:** `apps/web/components/tasks/task-form-dialog.tsx`
- **Must include** `"use client"` at the top.
- Uses shadcn `Dialog` and `Select` from `@workspace/ui/components/`.
- Dual-purpose: create (empty form) and edit (pre-filled form). Controlled by `task` prop (null = create).
- Zod schema: title (required, max 100), description (optional, max 500), priority (enum).
- Uses `react-hook-form` with `zodResolver`. Mode: `"onBlur"`.
- **IMPORTANT:** Reset form values in a `useEffect` when `open` changes, using `task` values for edit or empty values for create.
- **IMPORTANT:** The Select component's `onValueChange` may pass `null`. Guard with `if (val) field.onChange(val)`.
- On submit: call `onSubmit(values)` and `onOpenChange(false)`.

### 8. Build the Task Item

- **File:** `apps/web/components/tasks/task-item.tsx`
- **Must include** `"use client"` at the top.
- Single table row with: Checkbox (toggle complete), title + description preview, priority Badge, edit and delete icon buttons.
- Completed tasks show strikethrough and muted text.
- Priority badge uses variant mapping: low = secondary, medium = default, high = destructive.
- Props: `task`, `onToggleComplete`, `onEdit`, `onDelete`.

### 9. Build the Task List

- **File:** `apps/web/components/tasks/task-list.tsx`
- **Must include** `"use client"` at the top.
- This is the main orchestrator component. It:
  1. Dispatches `fetchTasks` on mount.
  2. Manages local state for dialog open/close (`createDialogOpen`, `editingTask`, `deletingTask`).
  3. **Implements the optimistic flow for each operation:**
     - **Create:** Generates a `temp-{nanoid}` ID. Dispatches `optimisticAddTask` with the temp task. Dispatches `createTask` thunk. On `.catch()`, dispatches `rollbackAddTask` and calls `toast.error()`.
     - **Edit:** Stores `previousTask = { ...editingTask }`. Dispatches `optimisticUpdateTask`. Dispatches `updateTask` thunk. On `.catch()`, dispatches `rollbackUpdateTask(previousTask)` and calls `toast.error()`.
     - **Toggle complete:** Same pattern as edit, but only changes `completed` field.
     - **Delete:** Stores `taskToDelete = { ...deletingTask }`. Dispatches `optimisticDeleteTask`. Dispatches `deleteTask` thunk. On `.catch()`, dispatches `rollbackDeleteTask(taskToDelete)` and calls `toast.error()`.
  4. Renders loading skeleton when `status === 'loading'`.
  5. Renders error state with retry button when `status === 'failed'`.
  6. Renders empty state when `tasks.length === 0`.
  7. Renders the table with TaskItem rows.
  8. Renders all three dialogs (create, edit, delete confirm).
- **IMPORTANT:** Use `toast` from `"sonner"` for notifications. Show `toast.success()` on operation success and `toast.error()` on rollback.
- **IMPORTANT:** Use `.unwrap()` on thunk dispatch to enable `.then()` / `.catch()` chaining.

### 10. Build the Page

- **File:** `apps/web/app/items/page.tsx`
- **Must include** `"use client"` at the top.
- Renders `TaskList` inside a max-width container with responsive padding.

### 11. Write Tests

- **File:** `apps/web/features/tasks/__tests__/tasksSlice.test.ts`
- Test initial state.
- Test `clearTasksError` reducer.
- Test `fetchTasks` pending/fulfilled/rejected.
- Test `optimisticAddTask` adds task to beginning.
- Test `rollbackAddTask` removes temp task (create rollback).
- Test `createTask.fulfilled` replaces temp task with server task.
- Test `optimisticUpdateTask` applies changes.
- Test `rollbackUpdateTask` restores previous state (edit rollback).
- Test `updateTask.fulfilled` confirms server state.
- Test `optimisticDeleteTask` removes task.
- Test `rollbackDeleteTask` re-inserts task (delete rollback).
- Test `deleteTask.fulfilled` does not change state.

## Output

| File | Action | Description |
|------|--------|-------------|
| `apps/api/src/tasks/tasks.service.ts` | Create | In-memory tasks store with random failures |
| `apps/api/src/tasks/tasks.controller.ts` | Create | GET + POST + PATCH + DELETE endpoints |
| `apps/api/src/tasks/tasks.module.ts` | Create | NestJS module |
| `apps/api/src/app.module.ts` | Modify | Register TasksModule |
| `apps/web/features/tasks/tasksSlice.ts` | Create | Redux slice with optimistic + rollback reducers |
| `apps/web/lib/store/store.ts` | Modify | Add tasks reducer |
| `apps/web/components/tasks/task-list-loading.tsx` | Create | Skeleton loading state |
| `apps/web/components/tasks/task-list-empty.tsx` | Create | Empty state with CTA |
| `apps/web/components/tasks/delete-confirm-dialog.tsx` | Create | Delete confirmation dialog |
| `apps/web/components/tasks/task-form-dialog.tsx` | Create | Create/edit form dialog |
| `apps/web/components/tasks/task-item.tsx` | Create | Single task table row |
| `apps/web/components/tasks/task-list.tsx` | Create | Main task list orchestrator |
| `apps/web/app/items/page.tsx` | Create | Next.js page route |
| `apps/web/features/tasks/__tests__/tasksSlice.test.ts` | Create | Slice unit tests |

## Verification

1. **Type check:** `pnpm typecheck` passes with zero errors.
2. **Lint:** `pnpm lint` passes with zero errors.
3. **Tests:** `pnpm test` passes all tasks slice tests.
4. **Visual -- Create:** Navigate to `/items`. Click "Add Task." Fill in the form. Submit. Verify the task appears in the table IMMEDIATELY (before the 500-800ms API delay resolves).
5. **Visual -- Rollback:** Trigger a few creates until one fails (10% chance). Verify the task disappears and an error toast appears.
6. **Visual -- Edit:** Click the edit icon on a task. Change the title. Submit. Verify the title updates IMMEDIATELY.
7. **Visual -- Delete:** Click the delete icon. Verify a confirmation dialog appears. Confirm. Verify the task disappears IMMEDIATELY.
8. **Visual -- Toggle:** Click a checkbox. Verify it toggles IMMEDIATELY.
9. **Loading state:** Refresh the page. Verify skeleton rows appear before tasks load.
10. **Empty state:** Delete all tasks. Verify the empty state with CTA appears.
11. **Error handling:** Stop the API server. Refresh. Verify error state with retry button appears.
12. **Spec coverage:** Compare output against every acceptance criterion in `packages/specs/optimistic-crud.md`.
