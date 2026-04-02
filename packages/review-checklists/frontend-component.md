# Frontend Component Review Checklist

Use this checklist when reviewing any React component (`.tsx` file) in the project.

## Type Safety

- [ ] All props are explicitly typed with a TypeScript interface or type alias (no `any`).
- [ ] Event handlers have proper event types (e.g., `React.FormEvent<HTMLFormElement>`, `React.ChangeEvent<HTMLInputElement>`).
- [ ] State variables have explicit types where inference is insufficient.
- [ ] Generic components (tables, lists) use typed generics, not `any` or `unknown`.
- [ ] Imported types from external libraries use the library's own type exports.

## Accessibility

- [ ] Every `<input>`, `<select>`, and `<textarea>` has an associated `<label>` (via `htmlFor` or wrapping).
- [ ] Buttons have discernible text. Icon-only buttons use `aria-label`.
- [ ] Interactive elements are reachable via keyboard (Tab key).
- [ ] Focus order follows a logical reading sequence.
- [ ] Modal and dialog components trap focus when open.
- [ ] Form validation errors are linked to their field via `aria-describedby`.
- [ ] Error messages are announced to screen readers (via `role="alert"` or `aria-live`).
- [ ] Color is not the only means of conveying information (e.g., error states also have icons or text).
- [ ] Images have `alt` text. Decorative images use `alt=""`.
- [ ] `aria-sort` is used on sortable table column headers.
- [ ] Custom interactive components have appropriate ARIA roles.

## State Handling

- [ ] **Loading state** exists and disables interaction while data is being fetched or an action is in flight.
- [ ] **Error state** exists, displays a meaningful message, and offers a recovery action (retry button, link, etc.).
- [ ] **Empty state** exists for lists, tables, and any data-driven display. It shows a helpful message and a relevant CTA.
- [ ] **Success state** provides clear feedback (toast, redirect, inline message).
- [ ] State transitions are smooth -- no flash of undefined content between loading and populated states.

## Responsive Design

- [ ] The component renders correctly at 320px width (smallest mobile).
- [ ] The component renders correctly at 768px width (tablet).
- [ ] The component renders correctly at 1440px width (desktop).
- [ ] Text does not overflow its container at any breakpoint.
- [ ] Touch targets are at least 44x44px on mobile.
- [ ] Horizontal scrolling is avoided on the page level (individual elements like tables may scroll).

## Performance

- [ ] The component does not create new object or array references on every render (in props passed to children).
- [ ] Expensive computations are wrapped in `useMemo` where they cause measurable re-renders.
- [ ] Callbacks passed to memoized children are wrapped in `useCallback` where necessary.
- [ ] Lists render with stable `key` props (not array indices, unless the list is static and never reorders).
- [ ] Large lists use virtualization or pagination rather than rendering all items.
- [ ] Side effects in `useEffect` have correct dependency arrays (no missing or unnecessary deps).
- [ ] No `useEffect` is used where a derived value or event handler would suffice.

## Component Composition

- [ ] The component has a single responsibility. If it does too much, it should be split.
- [ ] Business logic (API calls, state management) is separated from presentation.
- [ ] Reusable UI elements are extracted into shared components, not duplicated.
- [ ] The component uses shadcn/ui primitives from `@workspace/ui/components/` where applicable, rather than building custom elements.
- [ ] Props are minimal -- the component does not accept props it ignores or passes through unnecessarily.
- [ ] The component is exported with a clear, descriptive name.

## Code Quality

- [ ] No `console.log` statements left in the code.
- [ ] No commented-out code blocks.
- [ ] No hardcoded strings that should be constants or come from a spec/config.
- [ ] No TODO comments that indicate unfinished work (unless explicitly documented as out of scope).
- [ ] The file follows the project's naming conventions (kebab-case files, PascalCase components).
- [ ] Imports are organized: external libraries first, then internal modules, then relative imports.
