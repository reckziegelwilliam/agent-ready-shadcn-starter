# How to Use This Repo with OpenAI Codex / ChatGPT

This guide explains how to use agent-ready-shadcn-starter with OpenAI Codex, ChatGPT (Code Interpreter / Advanced Data Analysis), or any OpenAI-powered coding agent to build features from specs using the included prompt packs and review checklists.

## The workflow

```
1. Prepare context    ->  Gather files and conventions into a single prompt
2. Load the spec      ->  Provide the feature specification upfront
3. Run prompts        ->  Execute the prompt pack step by step
4. Verify output      ->  Check against the production review rubric
5. Iterate and fix    ->  Correct issues, refine prompts
```

## Key differences from Claude-based workflows

Codex and ChatGPT agents have different strengths and constraints than Claude Code. The workflow adjusts for these:

| Concern | Adaptation |
|---------|-----------|
| Context window size | Front-load the most important files; summarize the rest |
| No direct file system access (ChatGPT) | Paste code or upload files; collect output as code blocks |
| Codex CLI has file access | Point it at specific paths, similar to Claude Code |
| Tends toward verbose output | Ask for "minimal, production-ready code only" |
| Strong at boilerplate generation | Lean into scaffolding prompts for repetitive patterns |
| May invent APIs | Always provide real file contents, not just descriptions |

## Setting up context

### Option A: Codex CLI (terminal agent)

If you are using OpenAI's Codex CLI, open the repo root:

```bash
cd agent-ready-shadcn-starter
codex
```

Provide the project context the same way you would with any terminal agent -- point to files and directories.

### Option B: ChatGPT (browser-based)

Since ChatGPT cannot read your file system, you need to provide context explicitly. Prepare a context block to paste at the start of the conversation:

```
## Project context

This is a monorepo with the following structure:
- apps/web: Next.js 16 with App Router, Tailwind CSS v4, shadcn/ui, Redux Toolkit
- apps/api: NestJS 11 backend
- packages/ui: Shared shadcn/ui components (imported as @workspace/ui)
- packages/prompts: AI prompt packs
- packages/specs: Feature specifications

Key conventions:
- Components use shadcn/ui from @workspace/ui/components/{name}
- State management uses Redux Toolkit with feature-based slices in features/{name}/
- Forms use React Hook Form + Zod validation
- File naming is kebab-case for components, camelCase+Slice for Redux slices
- Route groups use parenthesized directories: (auth), dashboard
- NestJS uses module-based architecture: {name}.controller.ts, {name}.service.ts
```

### Essential files to provide

Regardless of which tool you use, share these files as context:

1. **Architecture reference:**
   - `docs/architecture.md` (paste or upload the full file)

2. **Existing patterns to follow:**
   Upload or paste these reference implementations:
   ```
   apps/web/features/auth/authSlice.ts      -- Redux pattern
   apps/web/components/auth/login-form.tsx   -- Component pattern
   apps/api/src/auth/auth.controller.ts      -- API controller pattern
   apps/api/src/auth/auth.service.ts         -- API service pattern
   ```

3. **The spec for the feature you are building:**
   - Paste the full spec from `packages/specs/` or your custom spec

### Context tips for Codex / ChatGPT

- **Paste real code, not descriptions.** These models produce better output when they see actual patterns rather than summaries.
- **State constraints explicitly:** "Use only shadcn/ui components from @workspace/ui. Do not install new UI libraries."
- **Specify the file path for every file** you want generated: "Create this at `apps/web/components/settings/profile-form.tsx`."
- **Limit scope per prompt.** Ask for one file or one small group of related files at a time.

## Step 1: Start with a spec

Pick an existing spec from `packages/specs/` or write one using the template. The spec should include:

- Feature overview
- User stories
- Acceptance criteria
- Edge cases and error states
- Technical constraints

Paste the full spec into the conversation before you start prompting for code.

## Step 2: Feed the prompt pack

Prompt packs in `packages/prompts/` are numbered and designed to run sequentially. Each prompt builds on the previous output.

### How to run a prompt pack

1. **Paste prompt 01** into the conversation along with any files it references.
2. **Review the output.** Check that it follows the conventions and matches the spec.
3. **Paste prompt 02**, including any output from prompt 01 that the next prompt needs.
4. **Continue** until all prompts in the pack are complete.

### Example: Running the auth flow prompts

```
Prompt 01 (setup):     "Create the file structure, Zod schemas, and TypeScript types"
Prompt 02 (components): "Build the form components using shadcn/ui"
Prompt 03 (state):     "Create the Redux slice and wire up async thunks"
```

### Adapting prompts for ChatGPT

ChatGPT works best with self-contained prompts. For each prompt in the pack:

1. Include the relevant context (architecture, existing patterns)
2. Include the spec section that applies to this step
3. Include any code generated in previous steps that this step depends on
4. End with explicit output requirements:

```
Output requirements:
- Provide the complete file contents for each file
- Include the file path as a comment at the top of each code block
- Use TypeScript strict mode, no `any` types
- Follow the existing patterns shown in the context above
```

## Step 3: Review the output

After each prompt, review the generated code against `docs/production-review-rubric.md`.

### Self-review prompt

Paste this after the generated code to get the model to self-check:

```
Review the code you just generated. Check for:

1. Does it follow the import pattern? (@workspace/ui/components/{name})
2. Are all TypeScript types strict? No `any`, no implicit types.
3. Does every form input have a label, error message, and proper ARIA attributes?
4. Are loading, error, empty, and success states all handled?
5. Is the component responsive? Will it work on mobile?
6. Does the Redux slice follow the existing authSlice pattern?
7. Are Zod schemas used for all validation?

List any issues found and provide corrected code.
```

### Common issues with Codex / ChatGPT output

These are patterns to watch for:

| Issue | What to look for |
|-------|-----------------|
| Wrong import paths | Using relative imports instead of `@workspace/ui` |
| Invented dependencies | Importing packages not in `package.json` |
| Inline styles | Using `style={{}}` instead of Tailwind classes |
| Missing strict types | `any` types, untyped function parameters |
| Over-engineered abstractions | Extra wrapper components or utility functions not needed |
| Incomplete error handling | Happy path only, no loading or error states |
| Non-existent shadcn components | Referencing components not in `packages/ui/src/components/` |

## Step 4: Iterate and fix

When the output has issues:

1. **Be specific about what is wrong.** Instead of "this is wrong," say "the import path should be `@workspace/ui/components/button`, not `../ui/button`."
2. **Provide the corrected pattern.** Paste the correct version of the code so the model can see the difference.
3. **Update the prompt** for next time. If the model consistently makes the same mistake, add a constraint to the prompt.

### Documenting corrections

Record what went wrong in the example's `review-notes.md`:

```markdown
## Import paths

**AI output:** Used relative imports `../../../packages/ui/src/components/button`

**Issue:** Monorepo workspace imports must use the package alias.

**Fix:** Changed to `@workspace/ui/components/button`

**Prompt update:** Added to context: "Always import shared components as
@workspace/ui/components/{name}. Never use relative paths to packages/."
```

## Tips for Codex CLI

### Point to reference files

```
Read apps/web/components/auth/login-form.tsx and create a similar
component at apps/web/components/settings/profile-form.tsx.
Follow the same patterns for form handling, validation, and layout.
```

### Run verification after each step

```
Run these commands and report any errors:
pnpm typecheck
pnpm lint
```

### Keep prompts atomic

Instead of asking for an entire feature at once, break it into focused requests:

1. "Create the Zod schema and TypeScript types for the settings feature"
2. "Create the profile form component using those types"
3. "Create the Redux slice with async thunks for settings"
4. "Create the NestJS controller and service for settings"
5. "Wire the frontend to the API and verify with typecheck"

## Tips for ChatGPT

### Upload files instead of pasting when possible

If you are using ChatGPT with file upload, upload the reference files directly. This preserves formatting and avoids copy-paste errors.

### Use system instructions

If your ChatGPT plan supports custom instructions, add project conventions there so they persist across messages:

```
When generating code for this project:
- Use TypeScript strict mode, never use `any`
- Import UI components from @workspace/ui/components/{name}
- Use Tailwind CSS classes, never inline styles
- Use React Hook Form + Zod for form validation
- Use Redux Toolkit with createAsyncThunk for async state
- Follow kebab-case file naming for components
- Include proper ARIA attributes on all interactive elements
```

### Collect output into files

ChatGPT outputs code in chat. Copy each code block into the correct file path in your project. After all files are in place, run:

```bash
pnpm typecheck && pnpm lint
```

Fix any issues before moving to the next prompt in the pack.

## Reusing prompts across projects

The prompt packs work with any OpenAI-powered agent. To adapt them for a different project:

1. Copy the prompt files from `packages/prompts/`
2. Replace the **Context** section with your project's file paths, conventions, and stack
3. Keep the **Steps** and **Verification** sections, adjusting for your stack where needed
4. Test the adapted prompts and refine based on the output quality
