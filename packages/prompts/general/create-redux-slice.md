# Create Redux Slice

> Difficulty: Low-Medium

## Context

This prompt guides the creation of a new Redux Toolkit slice following the project's established patterns. Slices are the primary state management unit in this codebase.

- **Library:** `@reduxjs/toolkit` v2, `react-redux` v9
- **Store:** `apps/web/lib/store/store.ts`
- **Typed hooks:** `apps/web/lib/store/hooks.ts` (`useAppDispatch`, `useAppSelector`)
- **Convention:** Each feature's slice lives at `apps/web/features/{feature}/{feature}Slice.ts` (e.g. `features/tasks/tasksSlice.ts`) and exports its own types. Tests go in `apps/web/features/{feature}/__tests__/`.
- **API base URL:** `API_URL` from `apps/web/lib/api.ts`

## Input

1. The feature name and what state it manages.
2. The data shape -- what entities and UI state the slice tracks.
3. API endpoints the slice needs to call (if any).
4. Review the existing store: `apps/web/lib/store/store.ts`
5. Review any existing slices for pattern reference: `apps/web/features/*/*Slice.ts` (e.g. `apps/web/features/tasks/tasksSlice.ts`)

## Instructions

### Step 1: Define the State Interface

Define and export the interfaces at the top of the slice file (this repo has no separate `types.ts`):

- File: `apps/web/features/{feature}/{feature}Slice.ts`
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

- File: `apps/web/features/{feature}/{feature}Slice.ts`

Follow this structure:

```typescript
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store/store";
import { API_URL } from "@/lib/api";

export interface FeatureState { /* from Step 1 */ }
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

- File: `apps/web/lib/store/store.ts`
- Import the reducer (default export): `import featureReducer from "@/features/{feature}/{feature}Slice"`.
- Add it to the `reducer` map in `makeStore()`.
- Verify the `RootState` type automatically picks up the new slice (it should if `RootState` is inferred from `store.getState`).

### Step 4: Use in Components

- Import `useAppDispatch` and `useAppSelector` from `@/lib/store/hooks`.
- Dispatch async thunks: `dispatch(fetchItems())`.
- Select state: `const items = useAppSelector(selectItems)`.
- Use selectors for derived data. Simple reads like `useAppSelector((state) => state.feature)` are what the existing components do and are fine.

## Output

| File | Action | Description |
| ---- | ------ | ----------- |
| `apps/web/features/{feature}/{feature}Slice.ts` | Create | Interfaces + Redux Toolkit slice |
| `apps/web/features/{feature}/__tests__/{feature}Slice.test.ts` | Create | Slice tests |
| `apps/web/lib/store/store.ts` | Modify | Register the new reducer |

## Verification

1. **Type check:** `pnpm typecheck` passes. Pay attention to thunk generics and selector return types.
2. **Lint:** `pnpm lint` passes.
3. **Redux DevTools:** Open the app, trigger actions, and inspect the state tree in Redux DevTools. Verify:
   - Initial state shape is correct.
   - Async thunks produce `pending`, `fulfilled`, and `rejected` actions.
   - State updates match expectations.
4. **Review:** Run `packages/review-checklists/redux-slice.md` against the new slice.
