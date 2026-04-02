# Create Redux Slice

> Difficulty: Low-Medium

## Context

This prompt guides the creation of a new Redux Toolkit slice following the project's established patterns. Slices are the primary state management unit in this codebase.

- **Library:** `@reduxjs/toolkit` v2, `react-redux` v9
- **Store:** `apps/web/lib/store.ts`
- **Typed hooks:** `apps/web/lib/hooks.ts` (`useAppDispatch`, `useAppSelector`)
- **Convention:** Each feature's slice lives at `apps/web/features/{feature}/slice.ts`

## Input

1. The feature name and what state it manages.
2. The data shape -- what entities and UI state the slice tracks.
3. API endpoints the slice needs to call (if any).
4. Review the existing store: `apps/web/lib/store.ts`
5. Review any existing slices for pattern reference: `apps/web/features/*/slice.ts`

## Instructions

### Step 1: Define the State Interface

Create the types file first (if it does not already exist):

- File: `apps/web/features/{feature}/types.ts`
- Define the entity interface(s).
- Define the slice state interface with these standard fields:
  ```typescript
  interface FeatureState {
    // Domain data
    items: Item[];
    selectedItem: Item | null;

    // UI state
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  }
  ```
- Adapt the shape to your feature's needs, but always include `status` and `error`.

### Step 2: Create the Slice

- File: `apps/web/features/{feature}/slice.ts`

Follow this structure:

```typescript
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";
import type { FeatureState } from "./types";
```

**Initial state:**
- Define `initialState` as a typed constant matching the state interface.
- Set `status: "idle"`, `error: null`, and sensible defaults for domain data (empty arrays, null for optional values).

**Async thunks (if the feature calls APIs):**
- Name thunks as `{feature}/{action}` (e.g., `"users/fetchAll"`, `"users/deleteOne"`).
- Use `createAsyncThunk` with typed generics: `createAsyncThunk<ReturnType, ArgType>`.
- Extract error messages in the thunk body. Do not let raw Error objects reach the store:
  ```typescript
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return rejectWithValue(message);
  }
  ```
- Use `rejectWithValue` so the rejected action has a usable payload.

**Reducers (synchronous actions):**
- Use PayloadAction with typed payloads.
- Keep reducers pure -- no side effects, no API calls.
- Immer is built in, so you can write "mutative" code that looks like direct assignment.

**Extra reducers (async thunk handlers):**
- `pending`: Set `status: "loading"`, clear `error`.
- `fulfilled`: Set `status: "succeeded"`, store the data, clear `error`.
- `rejected`: Set `status: "failed"`, store `error` from `action.payload` or `action.error.message`.

**Selectors:**
- Export a selector for every piece of state a component will need.
- Name selectors as `select{Thing}` (e.g., `selectUsers`, `selectUserById`, `selectUsersStatus`).
- For derived data, use `createSelector` from `@reduxjs/toolkit` to memoize.
- Type the state parameter as `RootState`.

### Step 3: Register in the Store

- File: `apps/web/lib/store.ts`
- Import the reducer: `import { featureReducer } from "@/features/{feature}/slice"`.
- Add it to `configureStore({ reducer: { ..., feature: featureReducer } })`.
- Verify the `RootState` type automatically picks up the new slice (it should if `RootState` is inferred from `store.getState`).

### Step 4: Use in Components

- Import `useAppDispatch` and `useAppSelector` from `@/lib/hooks`.
- Dispatch async thunks: `dispatch(fetchItems())`.
- Select state: `const items = useAppSelector(selectItems)`.
- Never access `state.feature` directly in components -- always use selectors.

## Output

| File | Action | Description |
| ---- | ------ | ----------- |
| `apps/web/features/{feature}/types.ts` | Create | State and entity interfaces |
| `apps/web/features/{feature}/slice.ts` | Create | Redux Toolkit slice |
| `apps/web/lib/store.ts` | Modify | Register the new reducer |

## Verification

1. **Type check:** `pnpm typecheck` passes. Pay attention to thunk generics and selector return types.
2. **Lint:** `pnpm lint` passes.
3. **Redux DevTools:** Open the app, trigger actions, and inspect the state tree in Redux DevTools. Verify:
   - Initial state shape is correct.
   - Async thunks produce `pending`, `fulfilled`, and `rejected` actions.
   - State updates match expectations.
4. **Review:** Run `packages/review-checklists/redux-slice.md` against the new slice.
