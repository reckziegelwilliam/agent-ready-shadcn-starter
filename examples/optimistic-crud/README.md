# Optimistic CRUD Example

> Status: Coming Soon

## What This Will Cover

A CRUD interface with optimistic updates that provides instant feedback while syncing with the server in the background. This example demonstrates how to make server-backed operations feel instantaneous while handling failures gracefully.

**Planned operations:**
- Create: Add a new item to a list with immediate UI feedback
- Read: Fetch and display a paginated list of items
- Update: Inline editing that saves on blur with optimistic state
- Delete: Swipe-to-delete or button delete with undo capability

**Key patterns to demonstrate:**
- Optimistic state updates in Redux (apply immediately, revert on failure)
- Undo/redo for destructive operations (delete shows a toast with "Undo" button)
- Conflict resolution when the server state diverges from the optimistic state
- Retry logic for failed mutations with exponential backoff
- Loading indicators that only appear if the operation takes longer than 200ms (avoid flash of spinner)

## Related Files

- Spec: `packages/specs/optimistic-crud.md` (to be written)
- Prompt: `packages/prompts/build-optimistic-crud.md` (to be written)
