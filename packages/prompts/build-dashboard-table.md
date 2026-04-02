# Build Dashboard Table

> Target spec: `packages/specs/dashboard-table.md`
> Difficulty: High

## Context

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Table library:** `@tanstack/react-table` v8 (headless -- you provide the rendering)
- **State management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **UI components:** Imported from `@workspace/ui/components/` (shadcn/ui primitives)
- **Feature directory:** `apps/web/features/dashboard/` for all dashboard-related code
- **Pages directory:** `apps/web/app/dashboard/`
- **Key pattern:** The table is server-side paginated, sorted, and filtered. All state changes trigger a new API call. The client does not hold the full dataset.

## Input

1. Read the full spec: `packages/specs/dashboard-table.md`
2. Review available shadcn components: `packages/ui/src/components/`
3. Review the Redux store: `apps/web/lib/store.ts`
4. Review typed hooks: `apps/web/lib/hooks.ts`

## Instructions

### 1. Define Types

Create TypeScript interfaces for the users table domain.

- File: `apps/web/features/dashboard/types.ts`
- Define `User`, `UsersTableState`, `UsersResponse`, and `BulkDeleteRequest` as specified in the spec.
- Export all interfaces.

### 2. Build the Redux Slice

Create the users table slice with async thunks.

- File: `apps/web/features/dashboard/slice.ts`
- Initial state matches `UsersTableState` from the spec.
- Async thunks:
  - `fetchUsers` -- GET `/api/users` with query params built from current table state (page, pageSize, sortBy, sortDir, search, status, role). On success, store `data`, `totalCount`.
  - `deleteUsers` -- DELETE `/api/users` with `{ ids }` body. On success, re-fetch current page.
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

These components should be generic enough to reuse for other tables in the app.

**`apps/web/features/dashboard/components/data-table-column-header.tsx`**
- Props: `column` (from `@tanstack/react-table`), `title` (string).
- Renders the title with a sort button. Shows `ArrowUp`, `ArrowDown`, or `ArrowUpDown` icon from `lucide-react` depending on current sort state.
- Click cycles: none -> asc -> desc -> none.
- Sets `aria-sort` on the header cell.

**`apps/web/features/dashboard/components/data-table-pagination.tsx`**
- Props: `page`, `pageSize`, `totalCount`, `totalPages`, `onPageChange`, `onPageSizeChange`.
- Renders: "Showing X-Y of Z results" text, Previous/Next buttons (disabled at bounds), page size `Select` with options 10/20/50.
- Previous/Next buttons use `ChevronLeft` and `ChevronRight` icons.

**`apps/web/features/dashboard/components/data-table-toolbar.tsx`**
- Props: `search`, `onSearchChange`, `statusFilter`, `onStatusFilterChange`, `roleFilter`, `onRoleFilterChange`, `selectedCount`, `onBulkDelete`.
- Renders: search `Input` with magnifying glass icon, status `Select`, role `Select`.
- When `selectedCount > 0`, renders a "Delete selected (N)" button that triggers a confirmation dialog.
- The search input should accept `value` and `onChange` from the parent -- debounce logic lives in the parent component.

**`apps/web/features/dashboard/components/data-table-row-actions.tsx`**
- Props: `userId` (string).
- Renders a `DropdownMenu` triggered by an ellipsis icon button.
- Menu items: View, Edit, Delete. Each fires a callback or navigates.
- The Delete option uses destructive styling (red text).

**`apps/web/features/dashboard/components/status-badge.tsx`**
- Props: `status` ("active" | "inactive" | "suspended").
- Renders a shadcn `Badge` with variant mapped to status: active = default (green-tinted), inactive = secondary, suspended = destructive.

**`apps/web/features/dashboard/components/data-table-skeleton.tsx`**
- Props: `rows` (number, default 10), `columns` (number, default 7).
- Renders a `Table` filled with `Skeleton` components matching the real table dimensions.

**`apps/web/features/dashboard/components/data-table-empty.tsx`**
- Props: `onClearFilters` callback.
- Renders an illustration placeholder, "No users found" heading, descriptive text, and a "Clear all filters" button.

**`apps/web/features/dashboard/components/data-table-error.tsx`**
- Props: `message` (string), `onRetry` callback.
- Renders an error icon, the message, and a "Try again" button.

### 5. Build the Column Definitions

- File: `apps/web/features/dashboard/columns.tsx`
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

**`apps/web/features/dashboard/components/users-table.tsx`**

This is the orchestrator component.

- Initializes `useReactTable` with the column definitions and data from Redux.
- Manages local debounced search state: uses `useState` for the input value and `useEffect` with a 300ms timeout to dispatch `setSearch` to Redux.
- On mount: dispatches `fetchUsers`.
- On any filter/sort/page change in Redux: dispatches `fetchUsers` via a `useEffect` that watches the relevant state values.
- Renders based on `status`:
  - `"loading"` and no existing data: `DataTableSkeleton`.
  - `"loading"` with existing data: Table with reduced opacity (stale data visible while loading).
  - `"failed"`: `DataTableError`.
  - `"succeeded"` with empty data: `DataTableEmpty`.
  - `"succeeded"` with data: The full table with `DataTableToolbar` above and `DataTablePagination` below.
- The table body maps over `table.getRowModel().rows` to render each row.

### 7. Create the Page

**`apps/web/app/dashboard/users/page.tsx`**
- Renders `UsersTable`.
- Page metadata: `title: "Users"`.

### 8. Register the Slice

- File: `apps/web/lib/store.ts`
- Import `usersReducer` from `features/dashboard/slice` and add it under the `users` key.

## Output

| File | Action | Description |
| ---- | ------ | ----------- |
| `apps/web/features/dashboard/types.ts` | Create | TypeScript interfaces |
| `apps/web/features/dashboard/slice.ts` | Create | Redux slice with async thunks |
| `apps/web/features/dashboard/columns.tsx` | Create | TanStack Table column definitions |
| `apps/web/features/dashboard/components/data-table-column-header.tsx` | Create | Sortable column header |
| `apps/web/features/dashboard/components/data-table-pagination.tsx` | Create | Pagination controls |
| `apps/web/features/dashboard/components/data-table-toolbar.tsx` | Create | Search + filter toolbar |
| `apps/web/features/dashboard/components/data-table-row-actions.tsx` | Create | Per-row action dropdown |
| `apps/web/features/dashboard/components/status-badge.tsx` | Create | Status badge component |
| `apps/web/features/dashboard/components/data-table-skeleton.tsx` | Create | Loading skeleton |
| `apps/web/features/dashboard/components/data-table-empty.tsx` | Create | Empty state |
| `apps/web/features/dashboard/components/data-table-error.tsx` | Create | Error state with retry |
| `apps/web/features/dashboard/components/users-table.tsx` | Create | Main table orchestrator |
| `apps/web/app/dashboard/users/page.tsx` | Create | Next.js page |
| `apps/web/lib/store.ts` | Modify | Register users slice |

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
