# Dashboard Table Example

This example demonstrates how an AI agent builds a complex, interactive data table from a structured spec.

## What This Covers

- Server-side paginated data table with `@tanstack/react-table`
- Column sorting with API-driven sort (not client-side)
- Debounced global search and dropdown filters
- Row selection with bulk delete via confirmation dialog
- Loading skeleton, empty state, and error state with retry

## Tech Stack Used

- **Table:** `@tanstack/react-table` v8 (headless) with shadcn/ui `Table` for rendering
- **State:** Redux Toolkit slice managing table state (page, sort, filters, selection)
- **UI:** shadcn/ui `Table`, `Button`, `Input`, `Select`, `DropdownMenu`, `Checkbox`, `Badge`, `Skeleton`, `AlertDialog`
- **Icons:** `lucide-react` for sort arrows, search icon, action menus

## Files Produced

```
apps/web/features/dashboard/
  types.ts              -- User, UsersTableState, UsersResponse interfaces
  slice.ts              -- Users slice with fetchUsers and deleteUsers thunks
  columns.tsx           -- TanStack Table column definitions
  components/
    users-table.tsx               -- Main orchestrator component
    data-table-column-header.tsx  -- Sortable column header with icon
    data-table-pagination.tsx     -- Page navigation and size selector
    data-table-toolbar.tsx        -- Search input and filter dropdowns
    data-table-row-actions.tsx    -- Per-row action dropdown menu
    status-badge.tsx              -- Colored badge for user status
    data-table-skeleton.tsx       -- Loading skeleton matching table layout
    data-table-empty.tsx          -- Empty state with clear-filters CTA
    data-table-error.tsx          -- Error state with retry button

apps/web/app/dashboard/users/
  page.tsx              -- Next.js page rendering UsersTable
```

## How to Reproduce

1. Read the spec: [`packages/specs/dashboard-table.md`](../../packages/specs/dashboard-table.md)
2. Feed the prompt to your AI agent: [`packages/prompts/build-dashboard-table.md`](../../packages/prompts/build-dashboard-table.md)
3. The agent produces the files listed above.
4. Run the review: [`packages/review-checklists/full-feature.md`](../../packages/review-checklists/full-feature.md)

## How to Run

```bash
# From the monorepo root
pnpm dev

# Navigate to:
# http://localhost:3000/dashboard/users
```

## Key Patterns Demonstrated

- **Server-side table state:** All sorting, filtering, and pagination triggers an API call. The client never holds the full dataset. This scales to millions of rows.
- **Debounced search:** The search input maintains local state and dispatches to Redux after a 300ms delay, preventing excessive API calls during typing.
- **Component reusability:** `DataTableColumnHeader`, `DataTablePagination`, and `DataTableToolbar` are designed to be reused by other tables in the app.
- **State-driven rendering:** The `UsersTable` component branches on `status` to render skeleton, error, empty, or populated states. No state is missed.
- **Bulk operations with confirmation:** Row selection feeds into a bulk delete action that requires an `AlertDialog` confirmation before executing.

## Review Notes

See [`review.md`](./review.md) for a post-implementation analysis of what the AI got right, what it missed, and what was corrected.
