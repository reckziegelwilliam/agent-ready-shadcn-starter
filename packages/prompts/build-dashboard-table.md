# Build Dashboard Table

> Target spec: `packages/specs/dashboard-table.md`
> Difficulty: High

## Context

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Table library:** `@tanstack/react-table` v8 (headless -- you provide the rendering)
- **State management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **UI components:** Imported from `@workspace/ui/components/` (shadcn/ui primitives)
- **Slice directory:** `apps/web/features/users/` (`usersSlice.ts` plus `__tests__/`)
- **Components directory:** `apps/web/components/dashboard/` (the table primitives already live here)
- **Page:** `apps/web/app/dashboard/page.tsx` (route `/dashboard`)
- **API:** a new `users` module in `apps/api/src/users/`, mirrored for demo mode in `apps/web/lib/demo-api/store.ts` + `apps/web/app/api/users/route.ts`
- **API base URL:** import `API_URL` from `apps/web/lib/api.ts`
- **Key pattern:** The table is server-side paginated, sorted, and filtered. All state changes trigger a new API call. The client does not hold the full dataset.

> **Current state of the repo:** the reference implementation (see `examples/dashboard-table/README.md`) is a simpler client-side table over `apps/web/lib/mock-data/users.ts`, built from the generic `DataTable` in `apps/web/components/dashboard/`. This prompt upgrades it to the full server-driven version in the spec. Extend the existing files rather than creating parallel ones.

## Input

1. Read the full spec: `packages/specs/dashboard-table.md`
2. Review available shadcn components: `packages/ui/src/components/`
3. Review the Redux store: `apps/web/lib/store/store.ts`
4. Review typed hooks: `apps/web/lib/store/hooks.ts`
5. Review the existing table: `apps/web/app/dashboard/page.tsx` and `apps/web/components/dashboard/`
6. Review an existing slice + API pair for conventions: `apps/web/features/tasks/tasksSlice.ts` and `apps/api/src/tasks/`

## Instructions

### 1. Build the API Endpoints

- `apps/api/src/users/users.service.ts` -- in-memory users seeded from the same data as `apps/web/lib/mock-data/users.ts`; implements paging, sorting, search and filters; `delay()` helper for latency like the other services.
- `apps/api/src/users/users.controller.ts` -- `GET /users` (query params: page, pageSize, sortBy, sortDir, search, status, role) and `DELETE /users` (body `{ ids }`).
- `apps/api/src/users/users.module.ts`, registered in `apps/api/src/app.module.ts`.
- Mirror both endpoints in `apps/web/lib/demo-api/store.ts` and `apps/web/app/api/users/route.ts`, and add cases to `apps/web/lib/demo-api/__tests__/routes.test.ts`.

### 2. Build the Redux Slice (types live here)

Create the users table slice with async thunks. Types are exported from the slice file; there is no separate `types.ts`.

- File: `apps/web/features/users/usersSlice.ts`
- Export `User`, `UsersTableState`, `UsersResponse`, and `BulkDeleteRequest` as specified in the spec.
- Initial state matches `UsersTableState` from the spec.
- Async thunks (call `${API_URL}/users`):
  - `fetchUsers` -- GET `/users` with query params built from current table state (page, pageSize, sortBy, sortDir, search, status, role). On success, store `data`, `totalCount`.
  - `deleteUsers` -- DELETE `/users` with `{ ids }` body. On success, re-fetch current page.
- Table state actions (synchronous):
  - `setPage(page)` -- Updates page, triggers re-fetch.
  - `setPageSize(size)` -- Updates pageSize, resets page to 0, triggers re-fetch.
  - `setSort(column, direction)` -- Updates sort, triggers re-fetch.
  - `setSearch(query)` -- Updates search string (the component handles debounce, not the slice).
  - `setStatusFilter(status)` -- Updates filter, resets page to 0.
  - `setRoleFilter(role)` -- Updates filter, resets page to 0.
  - `toggleRowSelection(id)` -- Toggles a single row in `selectedIds`.
  - `toggleAllRows(ids)` -- Selects all or deselects all.
  - `clearSelection()` -- Empties `selectedIds`.
- Export selectors: `selectUsers`, `selectPagination`, `selectTableStatus`, `selectSelectedIds`, etc.

### 3. Ensure shadcn Components Are Available

Verify or install these components:

```bash
pnpm dlx shadcn@latest add table button input select dropdown-menu checkbox badge skeleton alert-dialog -c apps/web
```

### 4. Build Reusable Table Primitives

These components should be generic enough to reuse for other tables in the app. Several already exist in `apps/web/components/dashboard/`; update them in place.

**`apps/web/components/dashboard/data-table-column-header.tsx`** (new)
- Props: `column` (from `@tanstack/react-table`), `title` (string).
- Renders the title with a sort button. Shows `ArrowUp`, `ArrowDown`, or `ArrowUpDown` icon from `lucide-react` depending on current sort state.
- Click cycles: none -> asc -> desc -> none.
- Sets `aria-sort` on the header cell.

**`apps/web/components/dashboard/data-table-pagination.tsx`** (exists; switch to server-driven props)
- Props: `page`, `pageSize`, `totalCount`, `totalPages`, `onPageChange`, `onPageSizeChange`.
- Renders: "Showing X-Y of Z results" text, Previous/Next buttons (disabled at bounds), page size `Select` with options 10/20/50.
- Previous/Next buttons use `ChevronLeft` and `ChevronRight` icons.

**`apps/web/components/dashboard/data-table-toolbar.tsx`** (exists; add filters and bulk delete)
- Props: `search`, `onSearchChange`, `statusFilter`, `onStatusFilterChange`, `roleFilter`, `onRoleFilterChange`, `selectedCount`, `onBulkDelete`.
- Renders: search `Input` with magnifying glass icon, status `Select`, role `Select`.
- When `selectedCount > 0`, renders a "Delete selected (N)" button that triggers a confirmation dialog.
- The search input should accept `value` and `onChange` from the parent -- debounce logic lives in the parent component.

**`apps/web/components/dashboard/data-table-row-actions.tsx`** (new)
- Props: `userId` (string).
- Renders a `DropdownMenu` triggered by an ellipsis icon button.
- Menu items: View, Edit, Delete. Each fires a callback or navigates.
- The Delete option uses destructive styling (red text).

**`apps/web/components/dashboard/status-badge.tsx`** (new; today the badge is inline in `columns.tsx`)
- Props: `status` ("active" | "inactive" | "suspended").
- Renders a shadcn `Badge` with variant mapped to status: active = default (green-tinted), inactive = secondary, suspended = destructive.

**`apps/web/components/dashboard/data-table-loading.tsx`** (exists)
- Props: `rows` (number, default 10), `columns` (number, default 7).
- Renders a `Table` filled with `Skeleton` components matching the real table dimensions.

**`apps/web/components/dashboard/data-table-empty.tsx`** (exists; add clear-filters action)
- Props: `onClearFilters` callback.
- Renders an illustration placeholder, "No users found" heading, descriptive text, and a "Clear all filters" button.

**`apps/web/components/dashboard/data-table-error.tsx`** (exists)
- Props: `message` (string), `onRetry` callback.
- Renders an error icon, the message, and a "Try again" button.

### 5. Build the Column Definitions

- File: `apps/web/components/dashboard/columns.tsx` (exists; extend it)
- Define columns for `@tanstack/react-table` using `createColumnHelper<User>()`:
  - **Select** -- Checkbox column. Header checkbox toggles all. Row checkbox toggles individual.
  - **Name** -- Sortable. Renders the user name as text.
  - **Email** -- Sortable. Renders email as a `mailto:` link.
  - **Role** -- Sortable. Renders capitalized role text.
  - **Status** -- Sortable. Renders `StatusBadge`.
  - **Created At** -- Sortable. Renders formatted date (e.g., "Mar 15, 2025") using `Intl.DateTimeFormat`.
  - **Actions** -- Non-sortable. Renders `DataTableRowActions`.
- Export the columns array.

### 6. Build the Main Table Component

**`apps/web/components/dashboard/users-table.tsx`** (new), built on the generic `apps/web/components/dashboard/data-table.tsx`

This is the orchestrator component.

- Initializes `useReactTable` (in manual pagination/sorting/filtering mode) with the column definitions and data from Redux.
- Manages local debounced search state: uses `useState` for the input value and `useEffect` with a 300ms timeout to dispatch `setSearch` to Redux.
- On mount: dispatches `fetchUsers`.
- On any filter/sort/page change in Redux: dispatches `fetchUsers` via a `useEffect` that watches the relevant state values.
- Renders based on `status`:
  - `"loading"` and no existing data: `DataTableLoading`.
  - `"loading"` with existing data: Table with reduced opacity (stale data visible while loading).
  - `"failed"`: `DataTableError`.
  - `"succeeded"` with empty data: `DataTableEmpty`.
  - `"succeeded"` with data: The full table with `DataTableToolbar` above and `DataTablePagination` below.
- The table body maps over `table.getRowModel().rows` to render each row.

### 7. Create the Page

**`apps/web/app/dashboard/page.tsx`** (exists)
- Replace the mock-data `DataTable` with `UsersTable`.
- Keep the "Users" heading and description.

### 8. Register the Slice

- File: `apps/web/lib/store/store.ts`
- Import `usersReducer` from `@/features/users/usersSlice` and add it under the `users` key in `makeStore()`.

### 9. Tests

- `apps/web/features/users/__tests__/usersSlice.test.ts` -- reducers and thunk state transitions.
- Update `apps/web/components/dashboard/__tests__/data-table.test.tsx` for the new behavior.

## Output

| File | Action | Description |
| ---- | ------ | ----------- |
| `apps/api/src/users/users.{module,controller,service}.ts` | Create | NestJS users module |
| `apps/api/src/app.module.ts` | Modify | Register `UsersModule` |
| `apps/web/lib/demo-api/store.ts` | Modify | Demo-mode users data + logic |
| `apps/web/app/api/users/route.ts` | Create | Demo-mode route handler |
| `apps/web/features/users/usersSlice.ts` | Create | Types, async thunks, table state |
| `apps/web/components/dashboard/columns.tsx` | Modify | Column definitions |
| `apps/web/components/dashboard/data-table-column-header.tsx` | Create | Sortable column header |
| `apps/web/components/dashboard/data-table-pagination.tsx` | Modify | Server-driven pagination controls |
| `apps/web/components/dashboard/data-table-toolbar.tsx` | Modify | Search + filters + bulk delete |
| `apps/web/components/dashboard/data-table-row-actions.tsx` | Create | Per-row action dropdown |
| `apps/web/components/dashboard/status-badge.tsx` | Create | Status badge component |
| `apps/web/components/dashboard/data-table-loading.tsx` | Modify | Loading skeleton |
| `apps/web/components/dashboard/data-table-empty.tsx` | Modify | Empty state with clear filters |
| `apps/web/components/dashboard/data-table-error.tsx` | Keep | Error state with retry |
| `apps/web/components/dashboard/users-table.tsx` | Create | Main table orchestrator |
| `apps/web/app/dashboard/page.tsx` | Modify | Render `UsersTable` |
| `apps/web/lib/store/store.ts` | Modify | Register `users` reducer |
| `apps/web/features/users/__tests__/usersSlice.test.ts` | Create | Slice tests |

## Verification

1. **Type check:** `pnpm typecheck` passes with zero errors.
2. **Lint:** `pnpm lint` passes with zero errors.
3. **Loading state:** On initial page load, verify the skeleton renders with the correct number of rows.
4. **Populated state:** With data, verify all columns render correctly. Check that dates are formatted, status badges show correct colors, and emails are clickable.
5. **Sorting:** Click each sortable column header. Verify the arrow icon changes and a new API call is made. Verify the data order changes.
6. **Filtering:** Type in the search input. Verify a 300ms debounce before the API call fires. Verify results update. Test status and role dropdowns.
7. **Pagination:** Navigate between pages. Verify "Showing X-Y of Z" updates. Verify Previous is disabled on page 0. Change page size and verify page resets to 0.
8. **Row selection:** Select individual rows. Select all via header checkbox. Verify the bulk actions bar appears with the correct count.
9. **Bulk delete:** Select rows, click delete, verify confirmation dialog appears. Confirm and verify the API call fires and the table refreshes.
10. **Empty state:** Apply a filter that returns no results. Verify the empty state renders with a "Clear filters" button that works.
11. **Error state:** Simulate an API error. Verify the error state renders with a retry button that works.
12. **Responsive:** At < 768px, verify the table scrolls horizontally without breaking the page layout.
13. **Accessibility:** Verify semantic table elements, `aria-sort` attributes, labeled checkboxes, and keyboard navigation through all controls.
14. **Spec coverage:** Walk through every acceptance criterion in `packages/specs/dashboard-table.md`.
15. **Review:** Run `packages/review-checklists/frontend-component.md` and `packages/review-checklists/full-feature.md`.
