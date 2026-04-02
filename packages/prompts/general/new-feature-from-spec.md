# New Feature from Spec

> Difficulty: Varies

## Context

This is a generic prompt for turning any feature spec into a working implementation within the agent-ready-shadcn-starter monorepo. Use this when you have a spec in `packages/specs/` and need to build the feature from scratch.

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **State management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Forms:** `react-hook-form` with `@hookform/resolvers/zod` and `zod`
- **Tables:** `@tanstack/react-table` (if the feature includes a data table)
- **UI components:** `@workspace/ui/components/` (shadcn/ui primitives)
- **Feature convention:** Each feature lives in `apps/web/features/{feature-name}/`
- **Page convention:** Pages live in `apps/web/app/{route}/page.tsx`
- **Store:** `apps/web/lib/store.ts` (add new reducers here)
- **Typed hooks:** `apps/web/lib/hooks.ts` (`useAppDispatch`, `useAppSelector`)

## Input

1. **The spec file.** Read the entire spec from `packages/specs/{feature-name}.md`. This is your single source of truth for data models, API contracts, states, validation rules, and acceptance criteria.
2. **Existing features.** Skim `apps/web/features/` to understand the project's file organization and naming conventions. Follow them exactly.
3. **Available UI components.** Check `packages/ui/src/components/` so you use existing shadcn components instead of building from scratch.

## Instructions

Follow these steps in order. Do not skip ahead -- later steps depend on earlier ones.

### Step 1: Extract the Data Layer

From the spec's **Data Models** and **API Contracts** sections:

1. Create `apps/web/features/{feature}/types.ts` -- Export every TypeScript interface: entities, request/response bodies, and the feature's slice state shape.
2. Create `apps/web/features/{feature}/schemas.ts` -- Translate every rule from the spec's **Validation Rules** table into a `zod` schema. Export each schema and its inferred type (`z.infer<typeof schema>`).

### Step 2: Build the State Layer

From the spec's **API Contracts** and **States** sections:

3. Create `apps/web/features/{feature}/slice.ts` -- Build a Redux Toolkit slice:
   - Define initial state matching the state interface from Step 1.
   - Create an async thunk for each API endpoint in the spec. Use `createAsyncThunk` with proper error extraction.
   - Handle `pending`, `fulfilled`, and `rejected` in `extraReducers`.
   - Export synchronous actions for any UI-driven state changes (filters, selections, etc.).
   - Export memoized selectors for every piece of state a component will need.

4. Register the slice in `apps/web/lib/store.ts`.

### Step 3: Build the UI Layer

From the spec's **Screens/Components** and **States** sections:

5. Create each component listed in the spec under `apps/web/features/{feature}/components/`:
   - One file per component, using kebab-case file names.
   - Use shadcn/ui primitives from `@workspace/ui/components/`.
   - Implement every state variant listed in the spec's **States** table. This is critical -- AI agents commonly skip error and empty states.
   - Wire forms with `react-hook-form` and the `zod` schemas from Step 2.
   - Connect to Redux using `useAppSelector` and `useAppDispatch`.

6. For each component, verify:
   - Props are fully typed (no `any`).
   - All interactive elements are keyboard accessible.
   - Loading states disable interaction and show indicators.
   - Error states show the message and offer a recovery action.
   - Empty states show a helpful message and a relevant CTA.

### Step 4: Create the Pages

7. Create Next.js pages under `apps/web/app/{route}/`:
   - One `page.tsx` per screen in the spec.
   - Use route groups `(group-name)` for shared layouts if the feature has multiple screens with a common wrapper.
   - Export `metadata` for each page with an appropriate title.

### Step 5: Verify Against the Spec

8. Go through every item in the spec's **Acceptance Criteria** section. For each criterion:
   - Confirm the implementation addresses it.
   - If a criterion is not met, go back and fix it before proceeding.

9. Run the relevant review checklist from `packages/review-checklists/`:
   - `frontend-component.md` for each component.
   - `redux-slice.md` for the slice.
   - `full-feature.md` for end-to-end coverage.

## Output

The exact files depend on the spec, but the structure should be:

```
apps/web/features/{feature}/
  types.ts
  schemas.ts
  slice.ts
  components/
    {component-name}.tsx
    ...

apps/web/app/{route}/
  page.tsx
  layout.tsx (if needed)

apps/web/lib/store.ts (modified)
```

## Verification

1. `pnpm typecheck` -- Zero errors.
2. `pnpm lint` -- Zero errors.
3. `pnpm dev` -- Navigate to the feature's route. Manually test every state (idle, loading, error, success, empty).
4. Accessibility -- Tab through all interactive elements. Check for proper labels, ARIA attributes, and focus management.
5. Responsive -- Test at 320px, 768px, and 1440px widths.
6. Spec coverage -- Every acceptance criterion from the spec passes.
