# Production Review Rubric

This rubric is for reviewing AI-generated code before it ships. AI agents produce functional code quickly but consistently miss production concerns. Use this checklist to catch those gaps.

The detailed checklists live in `packages/review-checklists/`. This document provides the overview and explains how to use them.

## How to use this rubric

1. **Generate the feature** using the prompt pack
2. **Run through each section** below, checking every item
3. **Fix issues** in the code
4. **Update the prompt** so the AI gets it right next time
5. **Document findings** in the example's `review-notes.md`

Do not skip sections. AI-generated code will pass some sections easily and fail others badly. The sections it fails are usually the ones that matter most in production.

---

## 1. Accessibility

AI-generated UI almost always has accessibility gaps. Check every interactive element.

### Form inputs

- [ ] Every input has a visible `<label>` element (not just placeholder text)
- [ ] Labels are associated with inputs via `htmlFor` / `id`
- [ ] Required fields are indicated visually and programmatically (`aria-required`)
- [ ] Error messages are linked to inputs via `aria-describedby`
- [ ] Error messages use `role="alert"` or `aria-live="polite"` for screen readers

### Keyboard navigation

- [ ] All interactive elements are reachable via Tab key
- [ ] Tab order follows visual layout (no random jumps)
- [ ] Focus is visible on all interactive elements (focus ring)
- [ ] Modal dialogs trap focus while open
- [ ] Escape key closes modals and dropdowns
- [ ] Enter/Space activates buttons and links

### Screen readers

- [ ] Images have meaningful `alt` text (or `alt=""` for decorative images)
- [ ] Icons used as buttons have `aria-label`
- [ ] Loading states announce themselves (`aria-live` region)
- [ ] Dynamic content changes are announced
- [ ] Page title updates on navigation

### Color and contrast

- [ ] Text meets WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large)
- [ ] Information is not conveyed by color alone (icons, text, patterns too)
- [ ] Works in both light and dark mode

## 2. UI States

Every component that displays data or accepts input needs to handle multiple states. AI frequently generates only the "happy path."

### Data display components

- [ ] **Loading** -- Skeleton or spinner while data is fetching
- [ ] **Empty** -- Meaningful message when there is no data (not a blank screen)
- [ ] **Error** -- Clear error message with retry option on fetch failure
- [ ] **Success** -- Data displayed correctly with proper formatting
- [ ] **Partial** -- Handles incomplete or null fields gracefully

### Form components

- [ ] **Initial** -- Clean form with no validation errors showing
- [ ] **Validating** -- Real-time validation feedback as user types (where appropriate)
- [ ] **Submitting** -- Submit button disabled with loading indicator
- [ ] **Success** -- Confirmation message or redirect
- [ ] **Error** -- Inline field errors and/or form-level error message
- [ ] **Disabled** -- All inputs disabled during submission

### Interactive elements

- [ ] **Default** -- Normal appearance
- [ ] **Hover** -- Visual feedback on mouse over
- [ ] **Active/Pressed** -- Feedback during click/tap
- [ ] **Focus** -- Visible focus indicator for keyboard users
- [ ] **Disabled** -- Visually distinct, not clickable, cursor changes

## 3. TypeScript

AI agents take type shortcuts. Strict typing prevents runtime bugs.

- [ ] No `any` types anywhere (search the codebase: `grep -r ": any"`)
- [ ] No `as` type assertions unless absolutely necessary (with comment explaining why)
- [ ] Props interfaces defined for all components
- [ ] API response types match actual backend responses
- [ ] Union types or enums for finite sets of values (status, role, etc.)
- [ ] Discriminated unions for state that has different shapes per variant
- [ ] Optional properties use `?` (not `| undefined` unless intentional)
- [ ] Generic types where reuse is appropriate (not over-engineered)
- [ ] Return types on functions that are exported or non-trivial

## 4. Responsive Design

AI-generated layouts frequently break on mobile or have touch target issues.

- [ ] Layout works at 320px width (small mobile)
- [ ] Layout works at 768px width (tablet)
- [ ] Layout works at 1280px width (desktop)
- [ ] No horizontal scroll on any viewport
- [ ] Touch targets are at least 44x44px on mobile
- [ ] Text is readable without zooming on mobile
- [ ] Tables have a mobile-friendly alternative (cards, horizontal scroll, etc.)
- [ ] Navigation is usable on mobile (hamburger menu, drawer, etc.)
- [ ] Forms are usable on mobile (inputs not too small, keyboards appropriate)

## 5. Performance

Check for common performance issues in generated code.

### Rendering

- [ ] No unnecessary re-renders (check with React DevTools)
- [ ] Expensive computations wrapped in `useMemo`
- [ ] Callback functions wrapped in `useCallback` where needed (event handlers passed to child components)
- [ ] Lists use stable `key` props (not array index for sortable/filterable lists)

### Data fetching

- [ ] API calls are not duplicated on re-render
- [ ] Loading states prevent duplicate requests
- [ ] Large lists use pagination or virtualization
- [ ] Images use `next/image` with proper sizing

### Bundle size

- [ ] No unnecessary large dependencies imported
- [ ] Dynamic imports for heavy components not needed on initial load
- [ ] Tree-shakeable imports (named imports, not namespace imports)

## 6. Security

AI-generated code often skips security basics.

### Frontend

- [ ] User input is sanitized before display (no raw HTML rendering)
- [ ] No sensitive data in localStorage (tokens in httpOnly cookies)
- [ ] No secrets in client-side code or environment variables without `NEXT_PUBLIC_` prefix
- [ ] Forms include CSRF protection where applicable
- [ ] External links use `rel="noopener noreferrer"`

### Backend

- [ ] Input validation on all endpoints (DTOs with class-validator)
- [ ] Authentication checks on protected routes
- [ ] Authorization checks (users can only access their own data)
- [ ] Rate limiting on auth endpoints
- [ ] No sensitive data in error responses
- [ ] SQL/NoSQL injection prevention (parameterized queries)

## 7. Error Handling

AI-generated code usually has minimal error handling.

- [ ] Network errors are caught and displayed to the user
- [ ] API error responses are parsed and shown meaningfully
- [ ] Unexpected errors do not crash the app (error boundaries)
- [ ] Console errors are addressed, not ignored
- [ ] Failed operations can be retried by the user
- [ ] Error messages are user-friendly (not raw error objects or stack traces)

## 8. Code Quality

General code quality checks.

- [ ] No commented-out code left behind
- [ ] No TODO comments without a linked issue
- [ ] Consistent naming conventions (see CONTRIBUTING.md)
- [ ] No duplicated logic (extract shared utilities)
- [ ] Components are focused (single responsibility)
- [ ] Side effects are contained in hooks or thunks, not in render
- [ ] No hardcoded values that should be constants or configuration

---

## Scoring

For each section, rate the AI output:

| Score | Meaning |
|-------|---------|
| Pass | All items checked, no issues found |
| Minor | 1-2 items need fixing, no functional impact |
| Major | 3+ items or functional issues that affect users |
| Fail | Fundamental problems that require significant rework |

Track scores across examples to identify patterns in what AI consistently gets wrong. Use those patterns to improve prompt packs.
