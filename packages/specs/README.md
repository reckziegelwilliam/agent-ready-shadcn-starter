# Specs

Specs are structured feature specifications that serve as the single source of truth for what an AI agent (or human developer) should build. They define **what** to build, not **how** to build it.

## Why Specs Matter for AI-Assisted Development

AI agents produce dramatically better code when given a well-structured spec. Without one, agents tend to make assumptions about data shapes, skip edge cases, and ignore error states. A good spec eliminates ambiguity and gives the agent everything it needs to produce production-ready code on the first pass.

## Spec Structure

Every spec follows a consistent structure (see `_template.md`):

| Section              | Purpose                                                        |
| -------------------- | -------------------------------------------------------------- |
| **Overview**         | What the feature is and why it exists                          |
| **User Stories**     | Who uses it and what they need to accomplish                   |
| **Screens/Components** | The UI surface area broken down by view                     |
| **States**           | Every state each screen can be in (idle, loading, error, etc.) |
| **API Contracts**    | Request/response shapes for every endpoint                     |
| **Validation Rules** | Client-side and server-side validation constraints             |
| **Acceptance Criteria** | Concrete, testable conditions that define "done"            |

## Writing a Good Spec

1. **Be explicit about data shapes.** Define TypeScript interfaces for every entity, request body, and response body. Agents will use these verbatim.
2. **Enumerate all states.** For every screen, list idle, loading, error, success, and empty states. Describe what the user sees in each.
3. **Define validation rules up front.** Include regex patterns, min/max lengths, and error messages. This prevents the agent from inventing its own.
4. **Write acceptance criteria as testable statements.** Each criterion should be verifiable with a manual test or an automated assertion.
5. **Reference the tech stack.** Mention specific libraries (e.g., `react-hook-form`, `zod`, `@tanstack/react-table`) so the agent uses the right tools.

## Existing Specs

- [`auth-flow.md`](./auth-flow.md) -- Login, signup, and forgot-password flows
- [`dashboard-table.md`](./dashboard-table.md) -- Paginated, sortable, filterable data table

## Usage with Prompt Packs

Specs are consumed by prompt packs in `packages/prompts/`. A typical workflow:

1. Write or review the spec.
2. Feed the spec to the corresponding prompt (e.g., `build-auth-flow.md`).
3. The agent builds the feature.
4. Run the review checklist from `packages/review-checklists/` to verify quality.
