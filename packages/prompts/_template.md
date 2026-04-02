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

### 1. Define Types

Create the TypeScript interfaces from the spec's Data Models section.

- File: `apps/web/features/[feature]/types.ts`
- Export all interfaces that other files will import.

### 2. Create the Zod Schemas

Define validation schemas matching the spec's Validation Rules.

- File: `apps/web/features/[feature]/schemas.ts`
- Import and use `z` from `zod`.
- Export each schema and its inferred type.

### 3. Build the Redux Slice

Create the state slice with async thunks for each API endpoint.

- File: `apps/web/features/[feature]/slice.ts`
- Follow the async thunk pattern: `pending` sets loading, `fulfilled` sets data, `rejected` sets error.
- Export the reducer, actions, and selectors.

### 4. Build the UI Components

Create each component listed in the spec's Screens/Components section.

- Directory: `apps/web/features/[feature]/components/`
- One file per component.
- Use shadcn/ui primitives from `@workspace/ui/components/`.
- Implement every state from the spec's States section.

### 5. Create the Page

Wire everything together in the Next.js page.

- File: `apps/web/app/[route]/page.tsx`
- Import components, connect to Redux store.

### 6. Register the Slice

Add the slice reducer to the root store.

- File: `apps/web/lib/store.ts`

## Output

_List every file the agent should create or modify._

| File | Action | Description |
| ---- | ------ | ----------- |
| `apps/web/features/[feature]/types.ts` | Create | TypeScript interfaces |
| `apps/web/features/[feature]/schemas.ts` | Create | Zod validation schemas |
| `apps/web/features/[feature]/slice.ts` | Create | Redux Toolkit slice |
| `apps/web/features/[feature]/components/ComponentName.tsx` | Create | UI component |
| `apps/web/app/[route]/page.tsx` | Create | Next.js page |
| `apps/web/lib/store.ts` | Modify | Register new slice |

## Verification

_How the agent (or reviewer) should confirm the implementation is correct._

1. **Type check:** Run `pnpm typecheck` from the monorepo root. Zero errors.
2. **Lint:** Run `pnpm lint`. Zero errors.
3. **Visual:** Start the dev server (`pnpm dev`) and navigate to the route. Verify all states render correctly.
4. **Accessibility:** Tab through all interactive elements. Verify focus order is logical.
5. **Spec coverage:** Compare the output against every acceptance criterion in the spec. All should pass.
6. **Review checklist:** Run the relevant checklist from `packages/review-checklists/`.
