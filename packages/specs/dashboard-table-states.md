# State Matrix: Dashboard Table

> Documents every user-facing state for the data table. States marked "Not implemented" are known gaps.

## Screens

### Users Table (`/dashboard`)

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Idle/Loading** | Page loads, data fetching simulated | Skeleton table (header + N shimmer rows) | 2s `setTimeout` with `isLoading` state | Done |
| **Loaded** | Data available | Full table with sortable columns, filters, pagination | `@tanstack/react-table` with mock data | Done |
| **Empty** | No records match (or dataset empty) | Centered icon + "No users found" + optional CTA | `DataTableEmpty` component | Done |
| **Empty (filtered)** | Search/filter returns zero results | Same empty state but with "Clear filters" option | Toolbar shows active filter, empty state rendered | Done |
| **Sorting** | User clicks column header | Column header arrow changes direction, rows reorder | `onSortingChange` state handler | Done |
| **Filtering** | User types in search input | Table filters in real-time (300ms debounce) | Debounced `globalFilter` state | Done |
| **Row selection** | User checks row checkboxes | Selected count shown in toolbar, header checkbox for all | `rowSelection` state + checkbox column | Done |
| **Pagination** | User changes page or page size | Table updates, "Page X of Y" display, "Showing X-Y of Z" | `PaginationState` with 10/20/50 options | Done |
| **Error (server)** | API fetch fails | No distinct error UI | Mock data is hardcoded — no API call to fail | Not implemented |
| **Error (network)** | Offline during data fetch | No handling | No API integration yet | Not implemented |
| **Stale data** | Background refresh fails | No stale indicator | No polling or refetch mechanism | Not implemented |
| **Bulk action** | Multiple rows selected, user triggers action | No bulk action UI beyond selection count | Selection state exists but no action buttons | Not implemented |
| **Inline editing** | User edits a cell | No inline edit capability | Read-only table | Not implemented |
| **Permission denied** | User lacks read access | No access control | No auth check on route | Not implemented |
| **Large dataset** | 1000+ rows | No virtualization — renders all visible page rows | Pagination limits visible rows to 10/20/50 | Partial |

## Gap Summary

| Gap | Priority | Notes |
|-----|----------|-------|
| Server error state | High | Need API integration with error handling |
| Network error / offline | Medium | Need fetch wrapper with error type detection |
| Stale data indicator | Medium | Useful for dashboards with polling |
| Bulk actions (delete, export) | Medium | Selection mechanism exists, needs action handlers |
| Inline editing | Low | Significant feature, not typical for v1 |
| Row-level virtualization | Low | Only needed at 1000+ rows, pagination handles it for now |
| Access control | Medium | Route-level auth guard needed |

## AI Agent Observations

When generating this dashboard table, AI agents consistently:
1. Used client-side sorting (`getSortedRowModel()`) instead of `manualSorting` for server-side patterns
2. Put the debounce inside the filter callback instead of on the input handler
3. Coupled filter changes to pagination (clearing filters also reset to page 1 — correct, but clearing page on filter type wasn't handled)
4. Used generic "Select row" for all checkbox `aria-label`s instead of row-specific labels
5. Omitted `aria-sort` on sortable column headers
6. Did not consider what happens when selected rows are filtered out or paginated away
7. Generated a single empty state instead of distinguishing "no data" from "no results"
8. Did not handle stale data during pending refetch — showed empty state instead of preserving visible rows
