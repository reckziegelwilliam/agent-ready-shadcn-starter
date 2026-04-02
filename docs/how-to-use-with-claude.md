# How to Use This Repo with Claude

This guide explains how to use agent-ready-shadcn-starter with Claude Code or Claude to build features from specs using the included prompt packs and review checklists.

## The workflow

```
1. Pick a feature    ->  Choose or write a spec
2. Load context      ->  Give Claude the right files and conventions
3. Run prompts       ->  Execute the prompt pack step by step
4. Review output     ->  Check against the production review rubric
5. Fix and document  ->  Correct issues, update review notes
```

## Setting up Claude Code

If you are using Claude Code (Anthropic's CLI), open the repo root:

```bash
cd agent-ready-shadcn-starter
claude
```

Claude Code will automatically pick up the project context from the directory structure.

## Step 1: Start with a spec

Before prompting, decide what you are building. Use an existing spec from `packages/specs/` or write a new one following the template.

A good spec includes:
- What the feature does (overview)
- Who uses it and why (user stories)
- What "done" looks like (acceptance criteria)
- What can go wrong (edge cases and error states)
- Technical constraints (existing patterns to follow)

## Step 2: Give Claude context

AI coding agents produce better output when they understand the codebase. Before starting implementation, share these key files:

### Essential context to provide

1. **Tech stack and conventions:**
   ```
   Read the following files to understand the project:
   - package.json (root)
   - apps/web/package.json
   - apps/api/package.json
   - turbo.json
   - docs/architecture.md
   ```

2. **Existing patterns to follow:**
   ```
   Look at the auth feature as a reference implementation:
   - apps/web/features/auth/authSlice.ts (Redux pattern)
   - apps/web/components/auth/ (component pattern)
   - apps/web/app/(auth)/ (routing pattern)
   - apps/api/src/auth/ (API module pattern)
   ```

3. **The spec:**
   ```
   Here is the spec for the feature we are building:
   [paste or reference the spec file]
   ```

### Context tips

- Point to specific files, not just directories
- Show existing patterns you want replicated
- Mention constraints: "Use shadcn/ui components, not custom ones"
- Mention anti-patterns: "Do not use `any` types or inline styles"

## Step 3: Run the prompt pack

Prompt packs in `packages/prompts/` and `examples/*/prompts/` are designed to be executed in order. Each prompt builds on the previous one.

### Example: Running the auth flow prompts

```
Prompt 01 (setup):     Create the file structure and validation schemas
Prompt 02 (components): Build the form components with shadcn/ui
Prompt 03 (state):     Wire up Redux Toolkit state management
```

### Best practices for running prompts

- **Run one prompt at a time.** Review the output before moving to the next.
- **Check the verification criteria** at the end of each prompt before proceeding.
- **If the output is wrong, fix the prompt** rather than manually patching the code. This improves the prompt for next time.
- **Keep the conversation going.** Context from earlier prompts helps later ones.

## Step 4: Review against the rubric

After the implementation is generated, review it against `docs/production-review-rubric.md`.

### Quick review pass

Ask Claude to self-review:

```
Review the code you just generated against these criteria:

1. Accessibility: Are all interactive elements keyboard accessible?
   Do form inputs have proper labels? Are error messages announced?

2. States: Does the UI handle loading, error, empty, and success states?

3. Types: Is everything strictly typed? Any use of `any`?

4. Responsive: Will this work on mobile? Are touch targets large enough?

5. Edge cases: What happens with very long text? Empty data? Network failure?
```

### Common issues to check

These are patterns AI frequently gets wrong:

| Issue | What to look for |
|-------|-----------------|
| Missing loading states | No spinner or skeleton while data fetches |
| No error handling | Network failures silently swallowed |
| Accessibility gaps | Missing ARIA labels, no keyboard navigation |
| Type shortcuts | `any` types, missing discriminated unions |
| Hardcoded strings | Text that should be extracted or configurable |
| Missing form validation | Client-side only, no server validation |
| No empty states | Component breaks or shows nothing with no data |

## Step 5: Fix and document

### Fixing patterns

When you find an issue:

1. Fix it in the code
2. Update the prompt to prevent the issue next time
3. Document it in the example's `review-notes.md`

### Writing review notes

Review notes are valuable to other developers. Document:

- What the AI generated initially
- What was wrong with it
- How you fixed it
- What prompt change would prevent it

Example:

```markdown
## Form validation

**AI output:** Client-side validation only. No disabled state on submit button.

**Issue:** Button could be clicked multiple times during submission.
No visual feedback that the form was processing.

**Fix:** Added `isSubmitting` state from react-hook-form.
Disabled the button and showed a spinner during submission.

**Prompt update:** Added to verification criteria:
"Submit button must be disabled and show loading indicator during submission."
```

## Tips for Claude Code specifically

### Use the project structure

Claude Code can read files and understand your project. Point it at specific files:

```
Look at apps/web/components/auth/login-form.tsx and create
a similar component for the settings page following the same patterns.
```

### Be specific about file locations

```
Create the new component at apps/web/components/settings/profile-form.tsx
```

### Ask for incremental changes

Instead of "build the entire settings page," break it into steps:

1. "Create the route and page layout at apps/web/app/settings/page.tsx"
2. "Create the profile form component"
3. "Add the Redux slice for settings"
4. "Wire up the API endpoint"

### Verify as you go

After each step, ask:

```
Run pnpm typecheck and pnpm lint to verify there are no errors.
```

## Reusing prompts across projects

The prompt packs in `packages/prompts/` are designed to be portable. To use them in another project:

1. Copy the prompt files
2. Update the **Context** section with your project's specifics (file paths, package names, conventions)
3. Keep the **Steps** and **Verification** sections as-is or adapt to your stack

The structure (context, steps, verification) works regardless of the specific technology.
