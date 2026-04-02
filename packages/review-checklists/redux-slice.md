# Redux Slice Review Checklist

Use this checklist when reviewing a Redux Toolkit slice file (`slice.ts`).

## State Shape

- [ ] The state interface is explicitly defined in a `types.ts` file and imported.
- [ ] The state includes a `status` field with values `"idle" | "loading" | "succeeded" | "failed"`.
- [ ] The state includes an `error` field of type `string | null`.
- [ ] Initial state values are sensible defaults (empty arrays for lists, `null` for optional objects, `"idle"` for status).
- [ ] The state shape is as flat as possible. Deeply nested state is avoided.
- [ ] If the slice manages a collection, consider whether entity normalization (`createEntityAdapter`) is appropriate.
- [ ] No derived data is stored in state. Values that can be computed from other state values should be selectors instead.

## Immutable Updates

- [ ] Reducers use Immer's "mutative" syntax correctly (direct assignment is fine inside `createSlice` reducers).
- [ ] No spread-operator mistakes in nested updates (Immer handles this, but verify if the code uses manual spreading).
- [ ] Arrays are updated with `push`, `splice`, or reassignment -- not methods that return new arrays (Immer handles both, but be consistent).
- [ ] No accidental state mutations outside of reducers (e.g., in thunks or components).

## Async Thunks

- [ ] Each thunk uses `createAsyncThunk` with proper generic type arguments: `createAsyncThunk<ReturnType, ArgType>`.
- [ ] Thunk names follow the convention `"{feature}/{action}"` (e.g., `"users/fetchAll"`).
- [ ] Error handling in thunks uses `rejectWithValue` to pass a structured error message to the rejected case.
- [ ] The `catch` block extracts a user-friendly message from the error, not the raw Error object.
- [ ] Network requests in thunks use proper error checking (response status, thrown exceptions).
- [ ] Thunks that modify data (POST, PUT, DELETE) handle the success case appropriately (re-fetch, optimistic update, or response-based update).

## Extra Reducers (Thunk Handlers)

- [ ] Every thunk has all three handlers: `pending`, `fulfilled`, `rejected`.
- [ ] `pending` sets `status: "loading"` and clears `error: null`.
- [ ] `fulfilled` sets `status: "succeeded"`, stores the returned data, and clears `error: null`.
- [ ] `rejected` sets `status: "failed"` and stores the error from `action.payload` (if `rejectWithValue` was used) or `action.error.message`.
- [ ] Handlers do not perform side effects (no API calls, no console.log, no dispatching other actions).

## Selectors

- [ ] A selector exists for every piece of state a component needs.
- [ ] Selectors are named `select{Thing}` (e.g., `selectUsers`, `selectAuthError`).
- [ ] The state parameter is typed as `RootState`.
- [ ] Derived or computed selectors use `createSelector` from `@reduxjs/toolkit` to memoize the result.
- [ ] Selectors do not create new object/array references on every call (avoid `.map()` or `.filter()` without memoization).
- [ ] No component accesses `state.feature.field` directly -- all access goes through exported selectors.

## Loading State Management

- [ ] Components can distinguish between "never loaded" (`status: "idle"`) and "loaded but empty" (`status: "succeeded"` with empty data).
- [ ] Multiple concurrent thunks do not clobber each other's status (if the slice handles multiple async operations, use separate status fields or a status map).
- [ ] Stale data is handled appropriately during reloads (either cleared or shown with a loading overlay).

## Actions

- [ ] Synchronous actions use `PayloadAction<T>` with typed payloads.
- [ ] Action names are descriptive (e.g., `setSearch`, `toggleRowSelection`, `clearError`, not `update` or `set`).
- [ ] A `reset` action exists if the feature needs to clear state (e.g., when navigating away, logging out).
- [ ] Actions are exported from the slice for use in components.

## Registration

- [ ] The reducer is exported as the default export or a named `{feature}Reducer` export.
- [ ] The reducer is registered in `apps/web/lib/store.ts` under an appropriately named key.
- [ ] The `RootState` type automatically includes the new slice (inferred from `store.getState`).
