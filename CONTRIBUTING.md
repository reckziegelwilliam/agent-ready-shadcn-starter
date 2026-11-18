# Contributing to agent-ready-shadcn-starter

Thank you for contributing. This guide covers how to add feature examples, write specs, create prompt packs, and submit pull requests.

## Table of contents

- [Getting started](#getting-started)
- [Adding a new feature example](#adding-a-new-feature-example)
- [Writing a spec](#writing-a-spec)
- [Creating a prompt pack](#creating-a-prompt-pack)
- [Code style and conventions](#code-style-and-conventions)
- [Pull request process](#pull-request-process)

## Getting started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/agent-ready-shadcn-starter.git
   cd agent-ready-shadcn-starter
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
5. Start development:
   ```bash
   pnpm dev
   ```

## Adding a new feature example

Feature examples are the core content of this repo. Each one demonstrates the full cycle: spec, prompt, implementation, and review.

### Directory structure

Scaffold the files with the generator:

```bash
pnpm turbo gen feature
```

It creates:

```
packages/specs/your-feature.md          # The feature specification
packages/specs/your-feature-states.md   # The state matrix
packages/prompts/build-your-feature.md  # The prompt pack
examples/your-feature/README.md         # Overview, key patterns, file listing
examples/your-feature/review.md         # What the AI got wrong and how it was fixed
apps/web/app/your-route/page.tsx        # Page stub
apps/web/components/your-feature/index.ts
```

### Requirements for a complete example

- [ ] **Spec** -- Clear description of what the feature does, acceptance criteria, edge cases
- [ ] **Prompt pack** -- A `build-{feature}.md` prompt that walks through implementation step by step
- [ ] **Working implementation** -- Code in `apps/web/` and/or `apps/api/` that builds and runs
- [ ] **Review notes** -- Honest documentation of what AI got wrong and how you fixed it
- [ ] **Update the feature table** in README.md

### Implementation goes in the apps

The actual code lives in `apps/web/` and `apps/api/`. The `examples/` directory contains only the documentation (README and review notes); specs and prompts live in `packages/specs/` and `packages/prompts/`. This keeps the working code in the real app structure where it can be tested and built.

## Writing a spec

Good specs lead to good AI output. A spec should include:

### 1. Overview

A one-paragraph description of the feature and why it exists.

### 2. User stories

```
As a [user type], I want to [action] so that [benefit].
```

Keep it to 3-5 stories. More than that means the feature should be broken up.

### 3. Acceptance criteria

Concrete, testable criteria. Use checkboxes:

```markdown
- [ ] User can log in with email and password
- [ ] Invalid credentials show an inline error message
- [ ] Form disables submit button while request is in flight
- [ ] Successful login redirects to /dashboard
```

### 4. Edge cases and error states

List every state the UI needs to handle:

- Empty state (no data)
- Loading state
- Error state (network failure, validation, server error)
- Partial data
- Boundary values (very long text, special characters)

### 5. Technical constraints

- Which existing components to reuse
- State management approach
- API endpoints needed
- Accessibility requirements

### Template

See `packages/specs/README.md` for the spec template.

## Creating a prompt pack

Prompt packs are structured instructions for AI coding agents. They are not freeform requests.

### Structure

Each prompt should include:

1. **Context block** -- Tech stack, file paths, existing patterns
   ```markdown
   ## Context
   - Framework: Next.js 16 with App Router
   - UI: shadcn/ui components from @workspace/ui
   - State: Redux Toolkit in features/ directory
   - Styling: Tailwind v4 with CSS variables
   ```

2. **Task description** -- What to build, referencing the spec
   ```markdown
   ## Task
   Implement the login form component as described in the spec.
   The form should use react-hook-form with zod validation.
   ```

3. **Step-by-step instructions** -- Ordered implementation steps
   ```markdown
   ## Steps
   1. Create the Redux auth slice in `apps/web/features/auth/authSlice.ts`
   2. Create the LoginForm component (with its zod schema) in `apps/web/components/auth/login-form.tsx`
   3. Render it from `apps/web/app/(auth)/login/page.tsx`
   ```

4. **Verification criteria** -- How to confirm the output is correct
   ```markdown
   ## Verify
   - [ ] Form validates email format and required fields
   - [ ] Submit button shows loading state during request
   - [ ] Error message appears below the form on failure
   - [ ] TypeScript compiles with no errors
   ```

### Naming

Feature prompts are named `build-{feature}.md` and live in `packages/prompts/`. Order the steps inside the prompt in execution order. Reusable prompts go in `packages/prompts/general/`.

### Tips for better prompts

- Reference specific file paths, not just concepts
- Include the existing code patterns you want followed
- Mention what NOT to do (common AI mistakes)
- Keep each prompt focused on one concern

## Code style and conventions

### General

- **TypeScript** everywhere, strict mode, no `any`
- **Functional components** with hooks
- **Named exports** for components, default exports only for pages

### Frontend (Next.js)

- App Router with route groups for related pages
- shadcn/ui components imported from `@workspace/ui`
- Redux Toolkit slices in `features/{feature}/{feature}Slice.ts` (types exported from the slice); components in `components/{feature}/`
- React Hook Form + Zod for form handling
- Tailwind v4 utility classes, no inline styles

### Backend (NestJS)

- Module-based architecture: `{name}.module.ts`, `{name}.controller.ts`, `{name}.service.ts`
- Request bodies typed inline or as interfaces; services validate input and throw built-in Nest exceptions (no class-validator yet)
- One module per domain concept, mirrored for demo mode in `apps/web/lib/demo-api/` + `apps/web/app/api/`

### File naming

- Components: `kebab-case.tsx` (e.g., `login-form.tsx`)
- Slices: `camelCaseSlice.ts` (e.g., `authSlice.ts`)
- Utilities: `kebab-case.ts`
- Test files: `*.test.ts` or `*.test.tsx`

### Formatting

- Prettier handles formatting (run `pnpm format`)
- ESLint handles linting (run `pnpm lint`)
- Do not disable lint rules without a comment explaining why

## Pull request process

1. **Create an issue first** for new feature examples (use the Feature Example template)
2. **Branch from `main`** with a descriptive name:
   - `feat/settings-page-example` for new features
   - `fix/auth-form-validation` for bug fixes
   - `docs/prompt-pack-guide` for documentation
3. **Make your changes** following the conventions above
4. **Run checks locally**:
   ```bash
   pnpm build
   pnpm lint
   pnpm typecheck
   ```
5. **Fill out the PR template** completely
6. **Request review** -- all PRs need at least one review

### What makes a good PR

- Focused on one thing (one feature example, one fix, one doc update)
- Includes all parts of the example (spec, prompts, code, review notes)
- Passes all CI checks
- Has clear description of what changed and why
- Screenshots for any UI changes
