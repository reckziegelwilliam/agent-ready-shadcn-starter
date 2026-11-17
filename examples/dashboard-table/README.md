# Dashboard Table Example

This example demonstrates how an AI agent builds a complex, interactive data table from a structured spec.

## What This Covers

- Data table with `@tanstack/react-table` (client-side sorting, filtering and pagination over mock data)
- Debounced global search (300ms)
- Row selection with select-all checkbox
- Loading skeleton, empty state, and error state with retry (the page simulates a 2s load and a 10% chance of a server error)

> The spec in `packages/specs/dashboard-table.md` describes a server-driven table backed by an API and Redux slice. The current implementation is a simpler client-side version backed by `apps/web/lib/mock-data/users.ts`; it does not call the NestJS API. Treat the spec as the target if you extend it.

## Tech Stack Used

- **Table:** `@tanstack/react-table` v8 (headless) with shadcn/ui `Table` for rendering
- **State:** Local React state inside `DataTable` (sorting, filters, global filter, selection)
- **UI:** shadcn/ui `Table`, `Button`, `Input`, `Select`, `Checkbox`, `Badge`, `Skeleton`
- **Icons:** `lucide-react`

## Files

```
apps/web/app/dashboard/page.tsx                    -- Page: simulated load, error + retry, renders DataTable
apps/web/components/dashboard/
  data-table.tsx              -- Generic TanStack table with sorting, filtering, pagination, selection
  columns.tsx                 -- Column definitions (select, name, email, role badge, status badge, ...)
  data-table-toolbar.tsx      -- Debounced search input and selection count
  data-table-pagination.tsx   -- Page navigation and page size selector
  data-table-loading.tsx      -- Skeleton matching the table layout
  data-table-empty.tsx        -- Empty state with optional action
  data-table-error.tsx        -- Error state with retry button
  __tests__/data-table.test.tsx
apps/web/lib/mock-data/users.ts                    -- Mock users
```

## How to Reproduce

1. Read the spec: [`packages/specs/dashboard-table.md`](../../packages/specs/dashboard-table.md)
2. Feed the prompt to your AI agent: [`packages/prompts/build-dashboard-table.md`](../../packages/prompts/build-dashboard-table.md)
3. Compare the result with the files listed above.
4. Run the review: [`packages/review-checklists/full-feature.md`](../../packages/review-checklists/full-feature.md)

## How to Run

```bash
# From the monorepo root
pnpm dev

# Navigate to:
# http://localhost:3000/dashboard
```

## Key Patterns Demonstrated

- **Debounced search:** The search input keeps local state and calls `table.setGlobalFilter` after a 300ms delay.
- **Component reusability:** `DataTable` is generic over row type and columns; `DataTablePagination`, `DataTableToolbar`, `DataTableLoading`, `DataTableEmpty` and `DataTableError` can be reused by other tables.
- **State-driven rendering:** The page and table branch on loading, error, empty and populated states, so no state is missed.

## Review Notes

See [`review.md`](./review.md) for a post-implementation analysis of what the AI got right, what it missed, and what was corrected.
