# Dashboard Table

> Spec version: 1.0

## Overview

A paginated, sortable, filterable data table for managing users on an admin dashboard. Built with `@tanstack/react-table` for headless table logic and shadcn/ui `Table` components for rendering. The table supports column sorting, a debounced global search filter, configurable page sizes, and row selection with bulk actions.

## User Stories

- **As an** admin, **I want to** view a paginated list of users, **so that** I can browse the user base without loading thousands of records at once.
- **As an** admin, **I want to** sort users by any column, **so that** I can quickly find the most recent or alphabetically first users.
- **As an** admin, **I want to** filter users by searching across name and email, **so that** I can locate a specific user.
- **As an** admin, **I want to** select multiple users and perform bulk actions, **so that** I can manage users efficiently.

## Screens / Components

### Screen: Users Dashboard

**Route:** `/dashboard/users`

**Description:** A full-width data table with a toolbar above it (search input, filter controls) and pagination controls below it.

**Components:**
- `UsersTable` -- Top-level container. Initializes the `@tanstack/react-table` instance, manages table state, and dispatches API calls.
- `DataTableToolbar` -- Contains the search input (debounced), status filter dropdown, and role filter dropdown. Reusable across other tables.
- `DataTableColumnHeader` -- Renders a column header with sort indicator (ascending/descending/none). Click toggles sort direction.
- `DataTablePagination` -- Renders page navigation (previous/next), current page indicator, total row count, and page size selector (10/20/50).
- `DataTableRowActions` -- Per-row dropdown menu with actions: View, Edit, Delete. Uses shadcn `DropdownMenu`.
- `StatusBadge` -- Renders a colored badge for user status: active (green), inactive (gray), suspended (red).
- `DataTableSkeleton` -- Skeleton loading state matching the table layout. Renders placeholder rows with animated shimmer.
- `DataTableEmpty` -- Empty state with illustration and message. Shown when the query returns zero results.
- `DataTableError` -- Error state with retry button. Shown when the API call fails.

## States

### Users Dashboard

| State     | Condition                           | What the User Sees                                                      |
| --------- | ----------------------------------- | ----------------------------------------------------------------------- |
| Loading   | Initial fetch or page/sort change   | `DataTableSkeleton` with 10 shimmer rows, toolbar is interactive        |
| Populated | Data returned with 1+ rows          | Full table with data, pagination controls, row checkboxes               |
| Empty     | Data returned with 0 rows           | `DataTableEmpty` -- "No users found" with clear-filters CTA             |
| Error     | API returned 4xx/5xx                | `DataTableError` -- Error message with "Try again" button               |
| Filtering | User is typing in search (debounce) | Table shows stale data with subtle opacity reduction, spinner in search |

## Data Models

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  status: "active" | "inactive" | "suspended";
  createdAt: string; // ISO 8601
}

interface UsersTableState {
  data: User[];
  totalCount: number;
  page: number;        // 0-indexed
  pageSize: number;    // 10 | 20 | 50
  sortBy: keyof User | null;
  sortDirection: "asc" | "desc";
  search: string;
  statusFilter: User["status"] | "all";
  roleFilter: User["role"] | "all";
  selectedIds: string[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
```

## API Contracts

### `GET /api/users`

**Description:** Fetch a paginated, sorted, filtered list of users.

**Query Parameters:**

| Param      | Type   | Default | Description                                  |
| ---------- | ------ | ------- | -------------------------------------------- |
| `page`     | number | `0`     | Zero-indexed page number                     |
| `pageSize` | number | `10`    | Rows per page (10, 20, or 50)                |
| `sortBy`   | string | `createdAt` | Column to sort by                        |
| `sortDir`  | string | `desc`  | Sort direction: `asc` or `desc`              |
| `search`   | string | `""`    | Full-text search across `name` and `email`   |
| `status`   | string | `"all"` | Filter by status: `active`, `inactive`, `suspended`, or `all` |
| `role`     | string | `"all"` | Filter by role: `admin`, `member`, `viewer`, or `all` |

**Response (200):**
```typescript
interface UsersResponse {
  data: User[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}
```

**Error Responses:**

| Status | Code               | Message                     |
| ------ | ------------------ | --------------------------- |
| 400    | `INVALID_PARAMS`   | "Invalid query parameters"  |
| 401    | `UNAUTHORIZED`     | "Authentication required"   |
| 403    | `FORBIDDEN`        | "Insufficient permissions"  |
| 500    | `INTERNAL_ERROR`   | "Something went wrong"      |

### `DELETE /api/users` (Bulk)

**Description:** Delete multiple users by ID.

**Request:**
```typescript
interface BulkDeleteRequest {
  ids: string[];
}
```

**Response (200):**
```typescript
interface BulkDeleteResponse {
  deleted: number;
}
```

**Error Responses:**

| Status | Code             | Message                    |
| ------ | ---------------- | -------------------------- |
| 400    | `INVALID_IDS`    | "One or more IDs invalid"  |
| 401    | `UNAUTHORIZED`   | "Authentication required"  |
| 403    | `FORBIDDEN`      | "Insufficient permissions" |
| 500    | `INTERNAL_ERROR` | "Something went wrong"     |

## Validation Rules

| Input          | Rule                                        | Behavior                                    |
| -------------- | ------------------------------------------- | ------------------------------------------- |
| `search`       | Max 200 chars; debounced 300ms              | Truncate silently; delay API call           |
| `pageSize`     | Must be one of 10, 20, 50                   | Default to 10 if invalid                    |
| `page`         | Must be >= 0 and < totalPages               | Clamp to valid range                        |
| `sortBy`       | Must be a valid column key                  | Default to `createdAt` if invalid           |
| `ids` (delete) | Non-empty array of valid UUIDs              | Return 400 if empty or malformed            |

## Acceptance Criteria

### Table Rendering
- [ ] **AC-1:** Table renders with columns: checkbox, Name, Email, Role, Status, Created At, Actions.
- [ ] **AC-2:** Column widths are appropriate -- Name and Email columns take the most space.
- [ ] **AC-3:** Table is horizontally scrollable on screens narrower than 768px.

### Sorting
- [ ] **AC-4:** Clicking a column header sorts ascending. Clicking again sorts descending. A third click removes the sort.
- [ ] **AC-5:** Sort direction is indicated by an arrow icon in the column header.
- [ ] **AC-6:** Sorting triggers a new API call (server-side sort, not client-side).

### Filtering
- [ ] **AC-7:** Typing in the search input filters results after a 300ms debounce.
- [ ] **AC-8:** Status dropdown filters by user status. "All" shows all statuses.
- [ ] **AC-9:** Role dropdown filters by user role. "All" shows all roles.
- [ ] **AC-10:** Filters are combinable -- search + status + role all apply together.
- [ ] **AC-11:** Changing any filter resets the page to 0.

### Pagination
- [ ] **AC-12:** Pagination shows "Showing X-Y of Z results".
- [ ] **AC-13:** Previous/Next buttons are disabled at the first/last page respectively.
- [ ] **AC-14:** Page size selector offers 10, 20, and 50. Changing it resets to page 0.

### Row Selection
- [ ] **AC-15:** Checkbox in the header selects/deselects all visible rows.
- [ ] **AC-16:** Individual row checkboxes toggle selection.
- [ ] **AC-17:** When rows are selected, a bulk actions bar appears with "Delete selected (N)".
- [ ] **AC-18:** Bulk delete shows a confirmation dialog before executing.

### States
- [ ] **AC-19:** Loading state shows a skeleton with the correct number of rows matching `pageSize`.
- [ ] **AC-20:** Empty state shows a clear message and a button to clear all filters.
- [ ] **AC-21:** Error state shows the error message and a retry button that re-fetches.

### Accessibility
- [ ] **AC-22:** Table uses semantic `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` elements.
- [ ] **AC-23:** Sort buttons have `aria-sort` attributes.
- [ ] **AC-24:** Row selection checkboxes have accessible labels.
- [ ] **AC-25:** Keyboard navigation works for all interactive elements (sort, filter, pagination, actions).

## Out of Scope

- Inline row editing
- Column visibility toggles
- CSV/Excel export
- Advanced filters (date ranges, multi-select)
- Drag-and-drop column reordering

## Open Questions

- [ ] Should deleted users be soft-deleted or hard-deleted?
- [ ] Should the table support URL-based state (so the user can share a filtered view via URL)?
