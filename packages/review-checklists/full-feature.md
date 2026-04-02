# Full Feature Review Checklist

Use this checklist when reviewing an entire feature end-to-end. This is the most comprehensive checklist and references the other checklists for specific artifact types.

## Spec Coverage

- [ ] A spec exists for this feature in `packages/specs/`.
- [ ] Every acceptance criterion in the spec has been addressed in the implementation.
- [ ] The data models in code match the spec's Data Models section exactly (field names, types, optionality).
- [ ] The API contracts in code match the spec's API Contracts section (endpoints, request/response shapes, status codes).
- [ ] The validation rules in code match the spec's Validation Rules table (constraints, error messages).
- [ ] All screens listed in the spec have corresponding components and pages.
- [ ] Items listed in the spec's "Out of Scope" section are not implemented (no scope creep).

## Component-Level Review

Run `packages/review-checklists/frontend-component.md` for each component in the feature. Confirm:

- [ ] All components pass the frontend component checklist.
- [ ] Any Fail items have been documented with specific fix suggestions.

## API-Level Review (if applicable)

Run `packages/review-checklists/api-endpoint.md` for each API endpoint. Confirm:

- [ ] All endpoints pass the API endpoint checklist.
- [ ] Any Fail items have been documented with specific fix suggestions.

## Redux-Level Review (if applicable)

Run `packages/review-checklists/redux-slice.md` for the feature's slice. Confirm:

- [ ] The slice passes the Redux slice checklist.
- [ ] Any Fail items have been documented with specific fix suggestions.

## API and UI Integration

- [ ] UI components dispatch Redux thunks for API calls (no direct `fetch` in components).
- [ ] Loading indicators appear immediately when an API call starts.
- [ ] API errors are displayed to the user with actionable messages (not raw error strings or codes).
- [ ] Successful mutations (create, update, delete) refresh the affected data.
- [ ] Optimistic updates, if used, revert correctly on API failure.
- [ ] The UI does not flash between states (no momentary "undefined" content).

## All States Handled

This is the most common area where AI-generated code falls short. Verify each explicitly:

- [ ] **Loading state:** Renders a skeleton or spinner. Interactive elements are disabled.
- [ ] **Error state:** Renders the error message and a recovery action (retry, go back, etc.).
- [ ] **Empty state:** Renders a meaningful message and a CTA (add item, adjust filters, etc.).
- [ ] **Success state:** Provides feedback (toast, redirect, inline confirmation).
- [ ] **Idle state:** The initial state before any interaction renders correctly.
- [ ] **Partial failure state (if applicable):** Bulk operations show which items succeeded and which failed.

## Accessibility

- [ ] Every page can be navigated using only the keyboard (Tab, Enter, Escape, Arrow keys).
- [ ] Focus is managed correctly:
  - After form submission errors, focus moves to the first error field.
  - After closing a modal, focus returns to the trigger element.
  - After deleting an item, focus moves to a logical adjacent element.
- [ ] Screen reader testing: navigate the feature with VoiceOver (macOS) or NVDA. Verify:
  - All content is announced.
  - Error messages are announced when they appear.
  - Dynamic content changes are announced via `aria-live` regions.
- [ ] Form fields have visible labels (not just placeholders).
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large text).

## Responsive Design

- [ ] The feature works at 320px width without horizontal page scrolling.
- [ ] The feature works at 768px width (tablet layout).
- [ ] The feature works at 1440px width (desktop layout).
- [ ] Touch targets on mobile are at least 44x44px.
- [ ] Text remains readable at all breakpoints (no truncation that hides critical information).

## Error Boundaries

- [ ] An error boundary exists at the feature or page level to catch unexpected runtime errors.
- [ ] The error boundary renders a fallback UI, not a blank page.
- [ ] The error boundary logs the error for debugging.

## Performance

- [ ] The page loads within a reasonable time (no blocking operations in the render path).
- [ ] Lists and tables with potentially large datasets use pagination or virtualization.
- [ ] API calls are not duplicated (e.g., no re-fetch on every render due to missing dependency arrays).
- [ ] Images and assets are appropriately sized and lazy-loaded where applicable.

## Code Organization

- [ ] All feature code lives in `apps/web/features/{feature}/` (not scattered across the app).
- [ ] Types are in `types.ts`, schemas in `schemas.ts`, state in `slice.ts`.
- [ ] Components are in a `components/` subdirectory with one file per component.
- [ ] File names use kebab-case. Component names use PascalCase.
- [ ] No circular imports between files.
- [ ] Shared utilities are extracted to `apps/web/lib/` or the appropriate package, not duplicated.
