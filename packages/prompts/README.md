# Prompt Packs

Prompt packs are structured instructions that tell an AI agent exactly how to implement a feature in this codebase. They bridge the gap between a spec (what to build) and the actual code (how to build it).

## Why Prompt Packs Exist

Even with a detailed spec, an AI agent needs guidance on:
- Which files to create and where to put them
- Which libraries and patterns to use from this specific stack
- What order to build things in (data layer first, then UI, then wiring)
- How to verify the output is correct

A prompt pack provides all of this in a format optimized for AI consumption.

## Structure

Every prompt follows a consistent template (see `_template.md`):

| Section          | Purpose                                                    |
| ---------------- | ---------------------------------------------------------- |
| **Context**      | Background the agent needs -- stack, conventions, file paths |
| **Input**        | What the agent should read before starting (specs, existing code) |
| **Instructions** | Step-by-step build order                                   |
| **Output**       | The exact files the agent should produce                   |
| **Verification** | How to confirm the implementation is correct               |

## Available Prompts

### Feature-Specific
One per worked example in `examples/`:

- [`build-auth-flow.md`](./build-auth-flow.md) -- Login, signup, and forgot-password flows from the auth spec
- [`build-dashboard-table.md`](./build-dashboard-table.md) -- Data table with sorting, filtering, and pagination
- [`build-settings-page.md`](./build-settings-page.md) -- Tabbed settings with dirty state and optimistic toggles
- [`build-multi-step-wizard.md`](./build-multi-step-wizard.md) -- Multi-step onboarding wizard with per-step validation
- [`build-optimistic-crud.md`](./build-optimistic-crud.md) -- Task list with optimistic create/edit/delete and rollback
- [`build-file-upload.md`](./build-file-upload.md) -- Drag-and-drop upload with preview, progress, and retry

### General-Purpose (`general/`)
- [`new-feature-from-spec.md`](./general/new-feature-from-spec.md) -- Turn any spec into a feature implementation
- [`spec-to-page.md`](./general/spec-to-page.md) -- Turn a spec into a Next.js page and components
- [`spec-to-api.md`](./general/spec-to-api.md) -- Turn a spec into a NestJS module
- [`create-redux-slice.md`](./general/create-redux-slice.md) -- Create a new Redux Toolkit slice
- [`add-shadcn-component.md`](./general/add-shadcn-component.md) -- Add and customize a shadcn/ui component
- [`add-states.md`](./general/add-states.md) -- Implement the states a state matrix marks as not implemented or partial
- [`accessibility-pass.md`](./general/accessibility-pass.md) -- Audit and fix accessibility gaps
- [`testing-pass.md`](./general/testing-pass.md) -- Add tests for an existing feature
- [`refactor-to-production.md`](./general/refactor-to-production.md) -- Harden first-pass AI output for production
- [`review-checklist.md`](./general/review-checklist.md) -- Run an AI-assisted code review

New feature prompts are scaffolded by `pnpm turbo gen feature` (as `build-{name}.md`).

## How to Use

1. Open the prompt file.
2. Feed it to your AI agent along with the referenced spec (if applicable).
3. The agent follows the step-by-step instructions to produce the output files.
4. Run the verification steps to confirm correctness.
5. Use the corresponding review checklist from `packages/review-checklists/` for a final quality pass.

## Writing New Prompts

Use `_template.md` as your starting point. Key principles:

- **Be explicit about file paths.** Use full paths relative to the monorepo root.
- **Reference the spec.** Always tell the agent where to find the spec it should implement.
- **Order matters.** List instructions in dependency order -- create types before components that use them.
- **Include verification steps.** The agent should be able to self-check its own output.
- **Name conventions.** Feature-specific prompts: `build-{feature}.md`. General prompts go in `general/`.
