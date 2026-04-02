# AI-Assisted Code Review

> Difficulty: Low

## Context

This prompt guides an AI agent through a structured code review using the checklists in `packages/review-checklists/`. Use this after a feature has been implemented to catch common issues before merging.

- **Checklists location:** `packages/review-checklists/`
- **Available checklists:**
  - `frontend-component.md` -- For individual React components
  - `api-endpoint.md` -- For API route handlers
  - `redux-slice.md` -- For Redux Toolkit slices
  - `full-feature.md` -- For end-to-end feature review

## Input

1. The files to review. This can be:
   - A single component file
   - An entire feature directory (`apps/web/features/{feature}/`)
   - A list of changed files (e.g., from a PR diff)
2. The relevant spec from `packages/specs/` (if reviewing a spec-driven feature).
3. The relevant review checklist(s) from `packages/review-checklists/`.

## Instructions

### Step 1: Determine Which Checklists Apply

Based on the files being reviewed:

| Files being reviewed | Checklist to use |
| -------------------- | ---------------- |
| A `.tsx` component file | `frontend-component.md` |
| A `route.ts` or API handler | `api-endpoint.md` |
| A `slice.ts` file | `redux-slice.md` |
| An entire feature | `full-feature.md` (runs all others too) |

If reviewing a full feature, start with `full-feature.md` which references the others.

### Step 2: Read the Code

For each file under review:

1. Read the file completely.
2. Identify the component's purpose, its inputs (props/state), and its outputs (rendered UI/dispatched actions).
3. Note any patterns that differ from the rest of the codebase.

### Step 3: Run the Checklist

Go through the relevant checklist item by item. For each item:

- **Pass:** The code meets the criterion. Note it briefly.
- **Fail:** The code does not meet the criterion. Document:
  - What the issue is.
  - Where it occurs (file and approximate location).
  - A specific suggestion for how to fix it.
- **N/A:** The criterion does not apply to this code. Skip it.

### Step 4: Check Against the Spec (if applicable)

If there is a spec:

1. Read every acceptance criterion in the spec.
2. For each criterion, determine whether the implementation satisfies it.
3. Flag any acceptance criteria that are not met.

### Step 5: Compile the Review

Produce a structured review report with these sections:

1. **Summary** -- One paragraph overview of the code quality and any major concerns.
2. **Checklist Results** -- Table with columns: Item, Status (Pass/Fail/N/A), Notes.
3. **Issues Found** -- Detailed description of each Fail item with location and fix suggestion.
4. **Spec Coverage** -- List of acceptance criteria and their pass/fail status (if a spec was provided).
5. **Recommendations** -- Optional suggestions that are not blockers but would improve the code.

## Output

A review report in the format described above. This can be:
- Written to a file (e.g., `examples/{feature}/review.md`)
- Provided as a chat response
- Used to generate inline comments on a PR

## Verification

The review itself is the verification step. Confirm that:
1. Every checklist item was evaluated.
2. Every Fail item has a specific, actionable fix suggestion.
3. If a spec exists, every acceptance criterion was checked.
