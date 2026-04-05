# Optimistic CRUD -- Task List

> Spec version: 1.0

## Overview

A task management list where create, edit, delete, and toggle-complete operations update the UI instantly (optimistic updates) and roll back on API failure. Demonstrates the full optimistic CRUD pattern with confirmation dialogs, form validation, and toast-based error feedback.

## User Stories

- **As a** user, **I want to** see all my tasks in a table, **so that** I can track what needs to be done.
- **As a** user, **I want to** add a new task via a dialog form, **so that** I can capture work items quickly.
- **As a** user, **I want to** edit an existing task, **so that** I can correct or update details.
- **As a** user, **I want to** delete a task with confirmation, **so that** I don't accidentally lose work.
- **As a** user, **I want to** toggle task completion, **so that** I can mark items as done.
- **As a** user, **I want** operations to feel instant, **so that** the UI never feels sluggish.
- **As a** user, **I want** failed operations to roll back with a toast notification, **so that** I know something went wrong and my data is consistent.

## Screens / Components

### Screen: Task List

**Route:** `/items`

**Description:** A page with a title, description, and a table of tasks. A header bar contains an "Add Task" button that opens a creation dialog. Each task row shows a checkbox, title, priority badge, and action buttons (edit, delete).

**Components:**
- `TaskList` -- Main container. Fetches tasks on mount. Renders table, loading skeleton, empty state, or error state.
- `TaskItem` -- Single table row. Checkbox for completion toggle, title, priority badge, edit and delete icon buttons.
- `TaskFormDialog` -- Dialog with form for creating or editing a task. Title input, description textarea, priority select. Uses react-hook-form + zod.
- `DeleteConfirmDialog` -- Confirmation dialog before delete. Shows task title. Cancel and Delete buttons.
- `TaskListLoading` -- Skeleton loading state matching table layout.
- `TaskListEmpty` -- Empty state with icon and "Create your first task" call-to-action.

## States

### Task List (Global)

| State | Condition | What the User Sees |
|-------|-----------|-------------------|
| Loading | Initial GET /tasks in flight | Skeleton placeholders matching table layout |
| Loaded | Tasks fetched successfully | Table with task rows |
| Empty | Tasks fetched, array is empty | Empty state with icon and CTA button |
| Error (fetch) | GET /tasks failed | Error message with retry button |

### Create Task

| State | Condition | What the User Sees |
|-------|-----------|-------------------|
| Dialog open | User clicked "Add Task" | Dialog with empty form |
| Validating | User submitted with invalid fields | Inline validation errors under fields |
| Creating (optimistic) | Form submitted, POST in flight | Dialog closes, new task appears in table immediately |
| Create success | POST returned 200 | Task remains in table (ID updated from server response) |
| Create rollback | POST failed | Task removed from table, error toast shown |

### Edit Task

| State | Condition | What the User Sees |
|-------|-----------|-------------------|
| Dialog open | User clicked edit button | Dialog with pre-filled form |
| Validating | User submitted with invalid fields | Inline validation errors under fields |
| Editing (optimistic) | Form submitted, PATCH in flight | Dialog closes, task updates in table immediately |
| Edit success | PATCH returned 200 | Task shows updated values |
| Edit rollback | PATCH failed | Task reverts to previous values, error toast shown |

### Delete Task

| State | Condition | What the User Sees |
|-------|-----------|-------------------|
| Confirm dialog open | User clicked delete button | Confirmation dialog with task title |
| Deleting (optimistic) | User confirmed, DELETE in flight | Dialog closes, task removed from table immediately |
| Delete success | DELETE returned 200 | Task stays removed |
| Delete rollback | DELETE failed | Task reappears in table, error toast shown |

### Toggle Complete

| State | Condition | What the User Sees |
|-------|-----------|-------------------|
| Toggling (optimistic) | User clicked checkbox, PATCH in flight | Checkbox updates immediately |
| Toggle success | PATCH returned 200 | Checkbox stays in new state |
| Toggle rollback | PATCH failed | Checkbox reverts, error toast shown |

## Data Models

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

interface TasksState {
  tasks: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
```

## API Contracts

### `GET /tasks`

**Description:** Fetch all tasks.

**Response (200):**
```typescript
Task[]
```

### `POST /tasks`

**Description:** Create a new task.

**Request:**
```typescript
interface CreateTaskRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}
```

**Response (201):**
```typescript
Task // with generated id, completed: false, createdAt
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 500 | Random 10% failure (simulated) |

### `PATCH /tasks/:id`

**Description:** Update a task (any fields).

**Request:**
```typescript
Partial<Pick<Task, 'title' | 'description' | 'priority' | 'completed'>>
```

**Response (200):**
```typescript
Task // with updated fields
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 404 | Task not found |
| 500 | Random 10% failure (simulated) |

### `DELETE /tasks/:id`

**Description:** Delete a task.

**Response (200):**
```typescript
{ message: string }
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 404 | Task not found |
| 500 | Random 10% failure (simulated) |

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `title` | Required; min 1 char; max 100 chars | "Title is required" / "Title must be under 100 characters" |
| `description` | Optional; max 500 chars | "Description must be under 500 characters" |
| `priority` | Required; one of low, medium, high | "Priority is required" |

## Acceptance Criteria

- [ ] **AC-1:** Task list page loads and shows skeleton while fetching.
- [ ] **AC-2:** Tasks display in a table with checkbox, title, priority badge, and action buttons.
- [ ] **AC-3:** Empty state shows when no tasks exist with a CTA to create one.
- [ ] **AC-4:** "Add Task" button opens a dialog with title, description, and priority fields.
- [ ] **AC-5:** Creating a task adds it to the table immediately (optimistic), before the API responds.
- [ ] **AC-6:** If create fails, the task is removed from the table and an error toast appears.
- [ ] **AC-7:** Editing a task updates the table row immediately (optimistic).
- [ ] **AC-8:** If edit fails, the task reverts to its previous values and an error toast appears.
- [ ] **AC-9:** Deleting a task shows a confirmation dialog with the task title.
- [ ] **AC-10:** Confirming delete removes the task immediately (optimistic).
- [ ] **AC-11:** If delete fails, the task reappears and an error toast appears.
- [ ] **AC-12:** Toggling the checkbox updates immediately and rolls back on failure.
- [ ] **AC-13:** All operations show toast notifications on rollback.
- [ ] **AC-14:** Error state on initial fetch shows a retry button.
- [ ] **AC-15:** All interactive elements are keyboard accessible with proper labels.

## Out of Scope

- Pagination or infinite scroll
- Sorting or filtering
- Drag-and-drop reordering
- Due dates or assignees
- Real-time sync across tabs/devices
- Undo button on delete toast

## Open Questions

- [ ] Should completed tasks be visually distinct (strikethrough, muted)?
- [ ] Should the table be sortable by priority or created date?
