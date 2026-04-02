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
- [`build-auth-flow.md`](./build-auth-flow.md) -- Build the complete auth flow from the auth spec
- [`build-dashboard-table.md`](./build-dashboard-table.md) -- Build the dashboard data table from the table spec

### General-Purpose (`general/`)
- [`new-feature-from-spec.md`](./general/new-feature-from-spec.md) -- Turn any spec into a feature implementation
- [`add-shadcn-component.md`](./general/add-shadcn-component.md) -- Add and customize a shadcn/ui component
- [`create-redux-slice.md`](./general/create-redux-slice.md) -- Create a new Redux Toolkit slice
- [`review-checklist.md`](./general/review-checklist.md) -- Run an AI-assisted code review

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
