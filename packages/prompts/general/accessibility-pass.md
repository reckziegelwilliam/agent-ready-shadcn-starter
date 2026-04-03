# Accessibility Pass

> Target spec: N/A (applies to any set of components)
> Difficulty: Medium

## Context

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **UI components:** Imported from `@workspace/ui/components/` (shadcn/ui primitives). These generally have good baseline accessibility, but generated code that wraps them often introduces gaps.
- **Icons:** `lucide-react` for all icons. Icon-only buttons must always have `aria-label`.
- **Goal:** Systematically audit and fix accessibility issues in AI-generated components. AI agents consistently miss: `aria-label` on icon-only buttons, `aria-describedby` on form fields with errors, keyboard navigation for custom widgets, focus management for modals/dropdowns, and `aria-sort` on sortable table headers.
- **Standard:** WCAG 2.1 Level AA compliance.

## Input

1. Read the components to audit, as specified by the user.
2. Read the accessibility guidelines document if it exists: `packages/docs/accessibility-rules.md`.
3. Review any existing tests for accessibility patterns: `apps/web/__tests__/`.
4. List all interactive elements in each component (buttons, links, inputs, selects, checkboxes, custom controls).

## Instructions

### 1. Audit Labels and Descriptions

For every interactive element in each component:

- **Buttons with text:** Ensure the text clearly describes the action. Avoid generic labels like "Click here" or "Submit."
- **Icon-only buttons:** Must have `aria-label` describing the action (e.g., `aria-label="Close dialog"`, not `aria-label="X"`).
- **Form inputs:** Must have an associated `<Label>` with `htmlFor` matching the input's `id`. If the label is visually hidden, use `sr-only` class.
- **Error messages:** Each form field error must be linked via `aria-describedby` pointing to the error element's `id`.
- **Images/icons:** Decorative icons must have `aria-hidden="true"`. Informational icons must have `aria-label` or be wrapped in descriptive text.

### 2. Audit Keyboard Navigation

For every custom widget (dropdown, modal, tab panel, data table):

- **Tab order:** Verify that Tab moves through interactive elements in a logical reading order. Use `tabIndex` only when absolutely necessary (prefer DOM order).
- **Escape:** Modals, dropdowns, and popovers must close on Escape and return focus to the trigger element.
- **Enter/Space:** All clickable elements must respond to Enter. Toggle controls (checkboxes, switches) must respond to Space.
- **Arrow keys:** Custom selects, tab lists, and menus should support arrow key navigation between options.
- **Focus trap:** Modals must trap focus within them while open. Tab from the last element should cycle to the first.

### 3. Audit ARIA Roles and States

- **Alerts:** Error banners and success messages must have `role="alert"` so screen readers announce them immediately.
- **Live regions:** Dynamic content updates (e.g., loading indicators, status changes) should use `aria-live="polite"` or `aria-live="assertive"` as appropriate.
- **Expanded state:** Dropdowns and accordions must have `aria-expanded` on their trigger, toggling between `true` and `false`.
- **Selected state:** Tabs must have `aria-selected` on the active tab. Table rows with selection must have `aria-selected`.
- **Sort state:** Sortable table columns must have `aria-sort` set to `ascending`, `descending`, or `none`.
- **Disabled state:** Use the HTML `disabled` attribute on native elements. For custom elements, use `aria-disabled="true"` and prevent click handlers.

### 4. Audit Focus Management

- **Auto-focus:** When a modal opens, focus should move to the first focusable element or the modal title.
- **Focus return:** When a modal or dropdown closes, focus should return to the element that triggered it.
- **Error focus:** After form submission with errors, focus should move to the first invalid field or to the error summary.
- **Page navigation:** After route changes, focus should move to the main content area or the page heading.
- **Focus visibility:** All focusable elements must have a visible focus indicator. Verify `focus-visible` styles are present (shadcn/ui provides these by default).

### 5. Audit Color and Contrast

- **Text contrast:** All body text must have at least 4.5:1 contrast ratio against its background. Large text (18px+ or 14px+ bold) needs 3:1.
- **Non-text contrast:** UI components (borders, icons, focus indicators) must have at least 3:1 contrast ratio.
- **Color as information:** Never use color alone to convey meaning. Error states must have text labels in addition to red coloring. Success must have text in addition to green.
- **Dark mode:** Verify all contrast requirements are met in both light and dark themes.

### 6. Audit Screen Reader Experience

Test each component with VoiceOver (macOS: Cmd+F5) or NVDA (Windows):

- Navigate through the page using VO+Right Arrow. Verify all content is announced in a logical order.
- Interact with every form field. Verify the label, current value, and any error message are announced.
- Trigger error and success states. Verify `role="alert"` content is announced.
- Use the rotor (VO+U) to browse headings, links, and form controls. Verify they are listed correctly.

### 7. Fix All Issues Found

For each issue found during the audit:

- Fix it directly in the component file.
- Add a code comment explaining why the fix was needed if the reasoning is not obvious.
- If the fix requires a shared utility (e.g., a focus trap hook), create it in `apps/web/hooks/`.

## Output

| File | Action | Description |
| ---- | ------ | ----------- |
| `apps/web/components/<feature>/*.tsx` | Modify | Accessibility fixes (labels, ARIA, keyboard) |
| `apps/web/hooks/use-focus-trap.ts` | Create | Focus trap hook (if modals need it) |
| `apps/web/hooks/use-focus-return.ts` | Create | Focus return hook (if needed) |

## Verification

1. **Type check:** `pnpm typecheck` passes with zero errors.
2. **Lint:** `pnpm lint` passes with zero errors.
3. **axe audit:** Run axe DevTools extension on each page. Zero critical or serious violations.
4. **Keyboard-only navigation:** Complete every user flow (login, signup, data table interaction) using only the keyboard. Every element must be reachable and operable.
5. **Screen reader test:** Navigate each page with VoiceOver. All content is announced in logical order. All errors are announced via `role="alert"`. All form fields announce their labels and errors.
6. **Focus indicators visible:** Every focusable element shows a clear focus ring. No elements have `outline: none` without a replacement indicator.
7. **Contrast check:** Use a contrast checker tool on all text elements in both light and dark mode. All meet WCAG AA requirements.
8. **No behavior regression:** All states (idle, loading, success, error) still function correctly after accessibility changes.
