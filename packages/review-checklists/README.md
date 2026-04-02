# Review Checklists

Structured checklists for reviewing code produced by AI agents (or humans). Each checklist targets a specific type of artifact and covers the most common issues found in AI-generated code.

## Why Checklists

AI agents produce code that compiles and often looks correct at first glance, but frequently has gaps in:
- Error and empty states (the most common miss)
- Accessibility (labels, ARIA, keyboard navigation)
- Edge cases in validation and data handling
- Performance (unnecessary re-renders, missing memoization)
- Consistent patterns with the rest of the codebase

These checklists systematize the review process so nothing gets missed.

## Available Checklists

| Checklist | Use When Reviewing |
| --------- | ------------------ |
| [`frontend-component.md`](./frontend-component.md) | Any React component (`.tsx` file) |
| [`api-endpoint.md`](./api-endpoint.md) | API route handlers, server actions |
| [`redux-slice.md`](./redux-slice.md) | Redux Toolkit slices |
| [`full-feature.md`](./full-feature.md) | An entire feature end-to-end (references all other checklists) |

## How to Use

### Manual Review
1. Open the relevant checklist.
2. Go through each item. Mark it Pass, Fail, or N/A.
3. For each Fail, note the specific issue and a suggested fix.

### AI-Assisted Review
1. Use the prompt at `packages/prompts/general/review-checklist.md`.
2. Provide the files to review and the spec (if applicable).
3. The AI agent reads the code, runs the checklist, and produces a structured report.

### In a PR Workflow
1. After the agent generates code, run the relevant checklists before merging.
2. Document the results in the PR description or a review comment.
3. Fix any Fail items before approving.

## Interpreting Results

- **Pass:** The code meets the criterion. No action needed.
- **Fail:** The code does not meet the criterion. This is a blocker -- fix it before merging.
- **N/A:** The criterion does not apply (e.g., "empty state" for a component that always has data).

A healthy review should have zero Fail items. If an item fails consistently across features, consider adding it to the project's lint rules or AI prompt instructions to prevent it at generation time.
