# Refactor to Production

> Target spec: N/A (applies to any AI-generated component)
> Difficulty: High

## Context

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **State management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **UI components:** Imported from `@workspace/ui/components/` (shadcn/ui primitives)
- **Utilities:** `cn()` from `@workspace/ui/lib/utils` for conditional class merging
- **Goal:** Take AI-generated components that work correctly and bring them to production quality without changing observable behavior. This means improving accessibility, eliminating duplication, adding proper typing, and separating concerns.
- **Key principle:** Preserve all existing behavior. This is a refactor, not a rewrite. If a test existed, it should still pass after refactoring.

## Input

1. Read the component(s) to refactor, as specified by the user.
2. Read the review checklist: `packages/review-checklists/frontend-component.md` (if it exists).
3. Read any related slice or hook files that the components depend on.
4. Check if tests exist for these components in `apps/web/__tests__/` or co-located `*.test.tsx` files.

## Instructions

### 1. Audit Against the Review Checklist

Read the review checklist and evaluate the component against every criterion. Note each failing item. Common issues in AI-generated code include:

- Missing `aria-label` on icon-only buttons
- Missing `aria-describedby` linking error messages to form fields
- Hardcoded strings instead of typed constants
- Inline SVGs instead of lucide-react icon components
- Duplicated loading spinner markup across components
- Missing keyboard navigation (Escape to close, Enter to submit)
- `any` types or missing return types on functions

### 2. Fix Accessibility Issues

For each accessibility gap found in the audit:

- Add `aria-label` to every interactive element that lacks visible text.
- Add `aria-describedby` to every form field that has an associated error message.
- Ensure focus management: when a modal or dropdown opens, focus moves to it. When it closes, focus returns to the trigger.
- Add `role="alert"` to error banners so screen readers announce them.
- Ensure all interactive elements are reachable via Tab and operable via Enter/Space.
- Verify color contrast meets WCAG 2.1 AA (4.5:1 for text, 3:1 for large text).

### 3. Extract Shared Logic into Custom Hooks

Identify repeated patterns across the components:

- If multiple components dispatch the same thunk and handle loading/error the same way, extract a custom hook (e.g., `useAuthAction`).
- If multiple components use the same form pattern (zodResolver + react-hook-form), consider a shared hook that returns the form object.
- Place custom hooks in `apps/web/hooks/` or `apps/web/features/<feature>/hooks.ts`.

### 4. Add Proper TypeScript Typing

- Replace `any` with specific types.
- Add explicit return types to all exported functions.
- Use `React.ComponentProps<typeof Component>` for prop forwarding instead of manually re-defining props.
- Ensure all event handlers have proper event types.
- Export prop interfaces for all components.

### 5. Remove Duplication

- Extract repeated UI patterns (loading spinners, error banners, empty states) into shared components in `apps/web/components/shared/`.
- Replace inline SVG icons with lucide-react icon components where applicable.
- Consolidate repeated Tailwind class strings into shared component variants or utility classes.

### 6. Separate View Logic from Data Logic

- Components should not contain `fetch` calls, `setTimeout` for data simulation, or direct API URL references.
- Move all data fetching and state management into Redux slices or custom hooks.
- Components should only receive data via props or selectors, and dispatch actions for mutations.
- Page-level components (`app/<route>/page.tsx`) orchestrate data flow; leaf components render UI.

### 7. Verify Behavior Preservation

- If tests exist, run them: `pnpm test`. All should still pass.
- If no tests exist, manually verify every user-facing state renders identically to before the refactor.
- Check that no console warnings or errors were introduced.

## Output

| File | Action | Description |
| ---- | ------ | ----------- |
| `apps/web/components/<feature>/*.tsx` | Modify | Refactored components with a11y fixes |
| `apps/web/components/shared/*.tsx` | Create | Extracted shared components (spinner, error banner, etc.) |
| `apps/web/hooks/*.ts` | Create | Custom hooks extracted from repeated logic |
| `apps/web/features/<feature>/*.ts` | Modify | Improved typing in slices and types |

## Verification

1. **Type check:** `pnpm typecheck` passes with zero errors.
2. **Lint:** `pnpm lint` passes with zero errors.
3. **Tests:** `pnpm test` passes with zero failures (if tests exist).
4. **Accessibility audit:** Use axe DevTools or similar to scan each page. Zero critical or serious violations.
5. **Keyboard navigation:** Tab through every interactive element on each page. Verify logical focus order and all controls are operable.
6. **Screen reader test:** Use VoiceOver (macOS) or NVDA (Windows) to navigate each page. Verify all content is announced correctly.
7. **No behavior change:** Visually compare each state (idle, loading, success, error, empty) before and after. They should look and behave identically.
8. **No new console errors:** Open DevTools console and navigate through all pages. Zero new warnings or errors.
9. **Review checklist:** Every item in `packages/review-checklists/frontend-component.md` now passes.
