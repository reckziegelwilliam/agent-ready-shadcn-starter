# Testing Pass

> Target spec: N/A (applies to any set of components and slices)
> Difficulty: Medium

## Context

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **State management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Test framework:** Vitest as the test runner, `@testing-library/react` for component tests, `@testing-library/user-event` for user interactions
- **Test location:** `apps/web/__tests__/` for all web app tests, mirroring the source directory structure
- **Store setup:** Tests that involve Redux state should use a test utility that wraps components with a fresh `<Provider store={...}>`. See `apps/web/__tests__/test-utils.tsx` if it exists.
- **Mocking:** Use `vi.fn()` for function mocks, `vi.mock()` for module mocks. Mock `fetch` globally for slice tests.
- **Goal:** Generate comprehensive test suites that cover Redux slices (reducers, async thunks) and UI components (rendering, user interaction, state handling). AI-generated code often ships without tests. This prompt creates them.

## Input

1. Read the components to test, as specified by the user.
2. Read the Redux slices to test: `apps/web/features/<feature>/<feature>Slice.ts`.
3. Read any existing tests for patterns: `apps/web/__tests__/`.
4. Read the test configuration: `apps/web/vitest.config.ts` or `vitest.config.ts` in the monorepo root.
5. Read test utilities if they exist: `apps/web/__tests__/test-utils.tsx`.

## Instructions

### 1. Create Slice Tests

For each Redux slice (`<feature>Slice.ts`):

**File:** `apps/web/__tests__/features/<feature>/<feature>Slice.test.ts`

- **Test initial state:** Verify the reducer returns the expected initial state when called with `undefined` state and an unknown action.
- **Test each reducer action:** For each synchronous action (e.g., `clearError`, `logout`), dispatch it and verify the resulting state.
- **Test each async thunk (pending):** Create a mock store, dispatch the thunk, and verify the pending action sets `status: 'loading'` and clears `error`.
- **Test each async thunk (fulfilled):** Mock `fetch` to return a successful response. Dispatch the thunk. Verify the fulfilled action sets `status: 'succeeded'` and stores the response data.
- **Test each async thunk (rejected - server error):** Mock `fetch` to return a non-OK response with a JSON error message. Dispatch the thunk. Verify the rejected action sets `status: 'failed'` and stores the error message.
- **Test each async thunk (rejected - network error):** Mock `fetch` to throw an error (simulating no connectivity). Dispatch the thunk. Verify the error message contains "Unable to connect."

### 2. Create Component Render Tests

For each component:

**File:** `apps/web/__tests__/components/<feature>/<ComponentName>.test.tsx`

- **Test default render:** Render the component in its idle state. Verify key elements are present using `screen.getByRole`, `screen.getByText`, or `screen.getByLabelText`.
- **Test loading state:** Render or trigger loading state. Verify spinner/skeleton is visible and interactive elements are disabled.
- **Test empty state:** Render with empty data. Verify the empty message and optional CTA appear.
- **Test error state:** Render with an error in the Redux store. Verify the error banner appears with `role="alert"`.
- **Test network error state:** Render with a network error message ("Unable to connect...") in the store. Verify the distinct amber banner and WiFi icon appear.
- **Test success state:** Render with successful data. Verify all data is displayed correctly.

### 3. Create Component Interaction Tests

For each component with user interactions:

- **Test form submission:** Use `userEvent.type()` to fill fields and `userEvent.click()` on the submit button. Verify the correct thunk is dispatched with the right arguments.
- **Test validation errors:** Submit with invalid data. Verify inline error messages appear for each invalid field.
- **Test retry button:** When an error state is shown with a retry button, click it and verify the thunk is re-dispatched.
- **Test navigation links:** Verify that links point to the correct `href` values.
- **Test keyboard interaction:** Use `userEvent.tab()` to move through elements and `userEvent.keyboard('{Enter}')` to activate buttons.

### 4. Create Integration Tests (Optional)

For critical user flows that span multiple components:

- **Test login flow:** Render the login page, fill credentials, submit, verify redirect on success.
- **Test error recovery:** Trigger an error, verify it displays, click retry, verify recovery.
- **Test state persistence:** Navigate between pages and verify Redux state is preserved correctly.

### 5. Set Up Test Utilities (If Missing)

If `apps/web/__tests__/test-utils.tsx` does not exist, create it with:

- A `renderWithProviders` function that wraps the component in `<Provider>` with a configurable store.
- A `createTestStore` function that creates a store with optional preloaded state.
- Re-export everything from `@testing-library/react` for convenience.

### 6. Verify Test Coverage

- Run `pnpm test --coverage` to check coverage numbers.
- Aim for at least 80% line coverage on slices (reducers and thunks are critical).
- Aim for at least 70% line coverage on components (focus on state rendering and interactions, not styling).
- Every state in the state matrix should have at least one corresponding test.

## Output

| File | Action | Description |
| ---- | ------ | ----------- |
| `apps/web/__tests__/features/<feature>/<feature>Slice.test.ts` | Create | Slice tests: reducers, thunks, selectors |
| `apps/web/__tests__/components/<feature>/<ComponentName>.test.tsx` | Create | Component render + interaction tests |
| `apps/web/__tests__/test-utils.tsx` | Create (if missing) | Shared test utilities with renderWithProviders |

## Verification

1. **All tests pass:** Run `pnpm test` from the monorepo root. Zero failures.
2. **No skipped tests:** Every test runs. No `it.skip()` or `describe.skip()` in the output.
3. **Slice coverage:** Each reducer action has at least one test. Each async thunk has tests for pending, fulfilled, and rejected states.
4. **Component coverage:** Each component has tests for idle, loading, error, and success renders. Each form has submission and validation tests.
5. **Network error coverage:** At least one test per feature verifies the distinct network error UI.
6. **Interaction coverage:** Every user-facing button, link, and form field is exercised in at least one test.
7. **No flaky tests:** Run the test suite three times. All three runs produce the same result.
8. **Coverage threshold:** `pnpm test --coverage` shows at least 80% on slices and 70% on components.
9. **Test isolation:** Each test file can run independently (`pnpm test <file>`) without depending on other test files.
