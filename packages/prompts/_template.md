# [Prompt Name]

> Target spec: `packages/specs/[spec-name].md` (if applicable)
> Difficulty: [Low / Medium / High]

## Context

_Provide the background an AI agent needs before it starts building. Include:_

- **Stack:** Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **State management:** Redux Toolkit with `@reduxjs/toolkit`
- **Forms:** `react-hook-form` with `@hookform/resolvers` and `zod`
- **Data tables:** `@tanstack/react-table`
- **UI components:** `@workspace/ui` (shadcn/ui components in `packages/ui/src/components/`)
- **Conventions:** [List any project-specific patterns -- file naming, folder structure, etc.]

## Input

_List everything the agent should read before starting._

1. Read the spec: `packages/specs/[spec-name].md`
2. Review existing patterns: `apps/web/features/[existing-feature]/` (if applicable)
3. Check available UI components: `packages/ui/src/components/`

## Instructions

_Step-by-step build order. Number each step. Group related steps under headings._

### 1. Build the API (if the feature needs data)

Follow the existing modules (e.g. `apps/api/src/tasks/`).

- NestJS: `apps/api/src/[feature]/` with `*.module.ts`, `*.controller.ts`, `*.service.ts` (in-memory data, `delay()` helper, built-in Nest exceptions). Register the module in `apps/api/src/app.module.ts`.
- Demo mode: mirror the same endpoints in `apps/web/lib/demo-api/store.ts` and add route handlers under `apps/web/app/api/[feature]/`, so the web app also works without the NestJS API. Same paths, payloads and error messages.

### 2. Build the Redux Slice (types live here)

Create the state slice with async thunks for each API endpoint. Types from the spec's Data Models section are exported from the slice file; there is no separate `types.ts`.

- File: `apps/web/features/[feature]/[feature]Slice.ts`
- Call endpoints as `${API_URL}/...` with `API_URL` imported from `@/lib/api`.
- Follow the async thunk pattern: `pending` sets loading, `fulfilled` sets data, `rejected` sets error. Distinguish network failures from server errors.
- Export the interfaces, the thunks and actions, and the reducer as the default export.

### 3. Build the UI Components

Create each component listed in the spec's Screens/Components section.

- Directory: `apps/web/components/[feature]/`
- One kebab-case file per component (e.g. `[feature]-form.tsx`).
- Zod schemas for a form live at the top of that form component, with `z.infer` for the form values type.
- Use shadcn/ui primitives from `@workspace/ui/components/`.
- Implement every state from the spec's States section.

### 4. Create the Page

Wire everything together in the Next.js page.

- File: `apps/web/app/[route]/page.tsx`
- Import components, connect to Redux via `useAppDispatch` / `useAppSelector` from `@/lib/store/hooks`.

### 5. Register the Slice

Add the slice reducer to `makeStore()`.

- File: `apps/web/lib/store/store.ts`
- Import from `@/features/[feature]/[feature]Slice`.

### 6. Write Tests

- `apps/web/features/[feature]/__tests__/[feature]Slice.test.ts` -- reducers and thunk state transitions.
- `apps/web/components/[feature]/__tests__/*.test.tsx` -- component behavior (Vitest + Testing Library).
- If you added endpoints, add cases to `apps/web/lib/demo-api/__tests__/routes.test.ts`.

## Output

_List every file the agent should create or modify._

| File | Action | Description |
| ---- | ------ | ----------- |
| `apps/api/src/[feature]/*.ts` | Create | NestJS module, controller, service (if needed) |
| `apps/api/src/app.module.ts` | Modify | Register the module |
| `apps/web/lib/demo-api/store.ts` | Modify | Demo-mode mirror of the endpoints |
| `apps/web/app/api/[feature]/**/route.ts` | Create | Demo-mode route handlers |
| `apps/web/features/[feature]/[feature]Slice.ts` | Create | Types, thunks, Redux Toolkit slice |
| `apps/web/components/[feature]/*.tsx` | Create | UI components (forms include their Zod schemas) |
| `apps/web/app/[route]/page.tsx` | Create | Next.js page |
| `apps/web/lib/store/store.ts` | Modify | Register new slice |
| `apps/web/features/[feature]/__tests__/[feature]Slice.test.ts` | Create | Slice tests |

## Verification

_How the agent (or reviewer) should confirm the implementation is correct._

1. **Type check:** Run `pnpm typecheck` from the monorepo root. Zero errors.
2. **Lint:** Run `pnpm lint`. Zero errors.
3. **Visual:** Start the dev server (`pnpm dev`) and navigate to the route. Verify all states render correctly.
4. **Accessibility:** Tab through all interactive elements. Verify focus order is logical.
5. **Spec coverage:** Compare the output against every acceptance criterion in the spec. All should pass.
6. **Review checklist:** Run the relevant checklist from `packages/review-checklists/`.
