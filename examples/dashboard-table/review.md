# Dashboard Table -- Post-Implementation Review

This document captures lessons from building the dashboard table with an AI agent, including common mistakes and how they were corrected.

## What the AI Got Right

**TanStack Table setup.** The agent correctly initialized `useReactTable` with column definitions, connected it to the data from Redux, and rendered the table using `table.getHeaderGroups()` and `table.getRowModel()`. The headless library integration was solid.

**Column definitions.** All columns were defined with proper accessors, sortable headers, and custom cell renderers (StatusBadge for status, formatted date for createdAt, DropdownMenu for actions).

**Redux slice structure.** The async thunks for `fetchUsers` and `deleteUsers` were correctly structured with proper query parameter serialization and error handling.

**Loading skeleton.** The agent created a skeleton component that closely matched the real table dimensions, providing a smooth loading experience.

## Common Mistakes Caught

### 1. Client-Side Sorting Instead of Server-Side

**Issue:** The agent implemented sorting using TanStack Table's built-in client-side sorting (`getSortedRowModel()`) instead of dispatching a new API call with updated sort parameters. This meant the table only sorted the current page of data, not the full dataset.

**Fix:** Removed `getSortedRowModel()` from the table options. Changed column header click handlers to dispatch `setSort(column, direction)` to Redux, which triggers a re-fetch with the new sort parameters. Set `manualSorting: true` on the table instance.

**Lesson:** When the spec says "server-side sort," the agent may still default to client-side because TanStack Table makes it easy. Be explicit in the prompt: "Set `manualSorting: true`. Do not use `getSortedRowModel()`."

### 2. Search Debounce Implemented Incorrectly

**Issue:** The agent put the debounce logic inside the Redux slice using a `setTimeout` in the thunk. This caused the search input to feel laggy because the input value was not updating until after the debounce.

**Fix:** Moved debounce to the component level: the search input updates local `useState` immediately (responsive typing), and a `useEffect` with a 300ms cleanup timer dispatches `setSearch` to Redux after the pause.

**Lesson:** Debounce belongs in the component, not the state layer. The input must update immediately for a responsive feel, while the API call is debounced.

### 3. Filter Changes Did Not Reset Page

**Issue:** Changing the status or role filter did not reset the page to 0. This meant applying a filter that reduced results to 3 items while on page 5 resulted in an empty table with no visible error.

**Fix:** Added `state.page = 0` to the `setStatusFilter`, `setRoleFilter`, and `setSearch` reducers in the slice.

**Lesson:** Include this rule explicitly in the prompt or spec: "Any filter change resets the page to 0."

### 4. Empty State Not Distinguishing "No Data" vs. "No Results"

**Issue:** The empty state showed the same message whether the table had no data at all or the current filters returned no results. Users who had filtered down to zero results saw "No users yet" instead of a message suggesting they adjust their filters.

**Fix:** Created two empty state variants: one for `totalCount === 0 && !hasActiveFilters` ("No users yet") and one for `totalCount === 0 && hasActiveFilters` ("No users match your filters" with a "Clear filters" button).

**Lesson:** Empty states need context. AI agents render a single generic empty state. The spec should distinguish between "no data exists" and "no data matches the current query."

### 5. Missing aria-sort on Column Headers

**Issue:** The column headers had visual sort indicators (arrow icons) but no `aria-sort` attributes. Screen reader users could not determine the current sort state.

**Fix:** Added `aria-sort="ascending"`, `aria-sort="descending"`, or `aria-sort="none"` to each `<th>` element based on the current sort state.

**Lesson:** This is a consistent miss in AI-generated table code. The review checklist catches it. Consider adding it to the prompt instructions explicitly.

### 6. Row Selection Checkbox Labels

**Issue:** The row checkboxes had no accessible label. Screen readers announced them as "checkbox" with no context about which row they controlled.

**Fix:** Added `aria-label="Select row for {user.name}"` to individual row checkboxes and `aria-label="Select all rows"` to the header checkbox.

**Lesson:** Checkboxes in tables always need labels that reference the row content. This applies to every data table, not just this one.

### 7. Bulk Delete Did Not Clear Selection

**Issue:** After a successful bulk delete, the selected IDs remained in Redux state. The next page load showed stale selection state, and the "Delete selected" button appeared with a count of already-deleted users.

**Fix:** Dispatched `clearSelection()` after a successful `deleteUsers` thunk, inside the `.fulfilled` extra reducer.

**Lesson:** Side effects of mutations (clearing related state) are easy to forget. Review every mutation thunk for cleanup actions that should happen on success.

### 8. Stale Data Flash During Refetch

**Issue:** When changing pages or sort order, the table briefly showed "No data" before the new data loaded, because the `fetchUsers.pending` handler cleared the existing `data` array.

**Fix:** Changed the `pending` handler to only set `status: "loading"` without clearing `data`. The table component now shows the stale data at reduced opacity while loading, and swaps in the new data on `fulfilled`.

**Lesson:** For tables with server-side data, preserve stale data during reloads. Only clear data on error or when a destructive filter change makes the stale data misleading.

## Acceptance Criteria Results

| AC    | Description                                      | Status |
| ----- | ------------------------------------------------ | ------ |
| AC-1  | All columns render correctly                     | Pass   |
| AC-2  | Column widths appropriate                        | Pass   |
| AC-3  | Horizontal scroll on narrow screens              | Pass   |
| AC-4  | Sort toggle: asc -> desc -> none                 | Pass (after fix #1) |
| AC-5  | Sort direction icon visible                      | Pass   |
| AC-6  | Sort triggers API call                           | Pass (after fix #1) |
| AC-7  | Search debounced at 300ms                        | Pass (after fix #2) |
| AC-8  | Status filter works                              | Pass   |
| AC-9  | Role filter works                                | Pass   |
| AC-10 | Filters are combinable                           | Pass   |
| AC-11 | Filter change resets page                        | Pass (after fix #3) |
| AC-12 | Pagination shows "Showing X-Y of Z"             | Pass   |
| AC-13 | Previous/Next disabled at bounds                 | Pass   |
| AC-14 | Page size selector resets to page 0              | Pass   |
| AC-15 | Header checkbox selects/deselects all            | Pass   |
| AC-16 | Row checkboxes toggle selection                  | Pass   |
| AC-17 | Bulk actions bar with count                      | Pass   |
| AC-18 | Confirmation dialog before bulk delete           | Pass   |
| AC-19 | Skeleton matches page size                       | Pass   |
| AC-20 | Empty state with clear-filters CTA               | Pass (after fix #4) |
| AC-21 | Error state with retry                           | Pass   |
| AC-22 | Semantic table elements                          | Pass   |
| AC-23 | aria-sort attributes                             | Pass (after fix #5) |
| AC-24 | Checkbox labels                                  | Pass (after fix #6) |
| AC-25 | Keyboard navigation                              | Pass   |

## Key Takeaways

1. **"Server-side" must be spelled out.** TanStack Table's client-side features are the path of least resistance. The prompt must explicitly disable them and route through the API.
2. **Debounce is a UI concern.** Placing it in Redux or a thunk creates input lag. Keep it in the component with local state.
3. **Filter-page coupling is non-obvious.** Agents do not automatically reset the page when filters change. Every filter action in the slice should include `state.page = 0`.
4. **Empty states need context.** A single empty state is insufficient. Distinguish between "no data exists" and "no data matches the query."
5. **Table accessibility is detail-heavy.** `aria-sort`, checkbox labels, and keyboard navigation through sort/filter/pagination controls all require explicit attention.
6. **Stale data is better than no data.** During re-fetches, show the previous data at reduced opacity instead of clearing it and showing a skeleton.
7. **Mutation cleanup is easy to forget.** After any create/update/delete operation, audit the Redux state for artifacts that need cleaning (selections, cached counts, etc.).
