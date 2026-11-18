# AGENTS.md

Instructions for AI coding agents (Cursor, Claude Code, Codex and others) working in this repo.

This repo is a **hardening framework** for AI-generated UI: every feature is built from a spec, with a prompt pack, and checked against a review checklist. When someone asks you to build something, follow the workflow below instead of generating code from scratch.

## The workflow (follow this for every new feature)

1. **Pick the closest example.** Read the six worked examples in `examples/` and choose the one closest to the request:

   | Example | Route | What it shows |
   |---------|-------|---------------|
   | `examples/auth-flow/` | `/login`, `/signup`, `/forgot-password` | Forms, validation, error handling |
   | `examples/dashboard-table/` | `/dashboard` | Sortable, filterable, paginated table (mock data) |
   | `examples/settings-page/` | `/settings` | Tabs, dirty state, optimistic toggles with rollback |
   | `examples/multi-step-wizard/` | `/wizard` | Step validation, progress indicator, review step |
   | `examples/optimistic-crud/` | `/items` | Create/edit/delete with optimistic updates and rollback |
   | `examples/file-upload/` | `/upload` | Drag and drop, preview, progress tracking |

   Each example has a `README.md` (key patterns and a file listing pointing at the real code in `apps/`) and a `review.md` (what the AI got wrong and how it was fixed). Read both, and read the files they list.

2. **Write or update the spec first.** Specs live in `packages/specs/`:
   - `{feature}.md` is the spec (start from `_template.md`)
   - `{feature}-states.md` is the state matrix (start from `_state-matrix-template.md`)

   For a new feature, scaffold everything at once with the generator (see Commands). Fill in the spec and state matrix before writing code. If the request is vague, write down your assumptions in the spec and tell the user what you assumed.

3. **Follow the prompt pack.** Prompt packs live in `packages/prompts/`:
   - `build-{feature}.md`: one per example (auth-flow, dashboard-table, settings-page, multi-step-wizard, optimistic-crud, file-upload). Use the closest one as a model.
   - `general/`: reusable passes: `new-feature-from-spec.md`, `spec-to-page.md`, `spec-to-api.md`, `create-redux-slice.md`, `add-shadcn-component.md`, `add-states.md`, `accessibility-pass.md`, `testing-pass.md`, `refactor-to-production.md`, `review-checklist.md`.

   Work through the instructions in order (data layer, then UI, then wiring) and run each prompt's Verification section.

   Some older prompts (notably `build-auth-flow.md` and `build-dashboard-table.md`) list output paths like `apps/web/features/{feature}/components/` or `slice.ts`. The code in this repo settled on a different layout. When a prompt disagrees with the existing code, **follow the existing code layout** described under "Where the code lives" below.

4. **Review against the checklists.** Checklists live in `packages/review-checklists/`:
   - `frontend-component.md` for any `.tsx` component
   - `redux-slice.md` for Redux Toolkit slices
   - `api-endpoint.md` for NestJS controllers and services
   - `full-feature.md` for the whole feature end to end

   `packages/prompts/general/review-checklist.md` describes how to run them. The longer rubric is in `docs/production-review-rubric.md`, and accessibility rules are in `docs/accessibility-rules.md`. Fix every Fail before calling the work done.

5. **Record what you fixed.** Add the feature's `examples/{feature}/review.md` notes (what the first pass got wrong, how it was fixed). If a mistake comes from the prompt, improve the prompt.

6. **Verify.** Run lint, typecheck, test and build (below) and make sure they pass. Report the results to the user.

## Commands

Package manager is **pnpm 9** (see `packageManager` in `package.json`). Run everything from the repo root.

| Command | What it does |
|---------|--------------|
| `pnpm install` | Install all workspaces |
| `pnpm dev` | Start web on http://localhost:3000 and API on http://localhost:4000 |
| `pnpm build` | Build everything (`turbo build`) |
| `pnpm lint` | ESLint across the monorepo |
| `pnpm typecheck` | `tsc --noEmit` across the monorepo |
| `pnpm test` | Vitest for `apps/web` and `apps/api` (`turbo test`) |
| `pnpm format` | Prettier |
| `pnpm turbo gen feature` | Scaffold a new feature (interactive) |
| `pnpm turbo gen feature --args <name> "<description>" /<route>` | Same, non-interactive (use this as an agent) |

Run a single workspace with a filter, for example `pnpm --filter web test` or `pnpm --filter @workspace/api dev`.

`pnpm turbo gen feature` creates:
- `packages/specs/{name}.md` and `packages/specs/{name}-states.md`
- `packages/prompts/build-{name}.md`
- `examples/{name}/README.md` and `examples/{name}/review.md`
- `apps/web/app/{route}/page.tsx` and `apps/web/components/{name}/index.ts`

## Where the code lives

```
apps/web/                 Next.js 16 App Router frontend (port 3000)
  app/                    Routes: (auth)/, dashboard/, settings/, wizard/, items/, upload/, compare/, quality/
  components/{feature}/   Feature components (kebab-case files)
  features/{feature}/     Redux Toolkit slices ({feature}Slice.ts) and __tests__/
  lib/store/              Redux store (store.ts), typed hooks (hooks.ts), provider
  lib/mock-data/          Mock data for the dashboard table
  lib/comparisons/        Data for the /compare before/after viewer
  lib/quality-data.ts     Data for the /quality dashboard
apps/api/                 NestJS 11 API (port 4000), one module per feature in src/{feature}/
packages/ui/              Shared shadcn/ui components (src/components), cn() in src/lib/utils.ts, globals.css
packages/specs/           Specs and state matrices
packages/prompts/         Prompt packs
packages/review-checklists/  Review checklists
examples/                 Docs for each worked example (README.md + review.md)
docs/                     Architecture, getting started, Claude/Codex guides, rubric, accessibility rules
```

## Conventions

- **UI components:** shadcn/ui on **Base UI** (`@base-ui/react`), style **`base-nova`**, base color neutral, Lucide icons. Config is in `apps/web/components.json` and `packages/ui/components.json`.
- **Reuse before you build.** Check `packages/ui/src/components/` first. Import as `@workspace/ui/components/{name}`. Add new primitives from the repo root with `pnpm dlx shadcn@latest add <component> -c apps/web` (it writes into `packages/ui/src/components/`). Don't hand-roll a component that shadcn provides.
- **shadcn MCP:** `.mcp.json` (Claude Code) and `.cursor/mcp.json` (Cursor) register the shadcn MCP server (`npx shadcn@latest mcp`). Use it to search registries, view examples and get the right `add` command.
- **Styling:** Tailwind CSS 4 via `@tailwindcss/postcss`. Theme tokens and CSS variables live in `packages/ui/src/styles/globals.css` (no `tailwind.config`). Use `cn()` for conditional classes.
- **State:** Redux Toolkit slices in `apps/web/features/{feature}/` with `createAsyncThunk` and pending/fulfilled/rejected handling. Register reducers in `apps/web/lib/store/store.ts`. Use `useAppDispatch` / `useAppSelector` from `apps/web/lib/store/hooks.ts`.
- **Forms:** `react-hook-form` + `@hookform/resolvers` + `zod` (v3).
- **Tables:** `@tanstack/react-table`.
- **Toasts:** `sonner`.
- **API:** NestJS modules with controller + service, data held in memory in the service, built-in Nest exceptions for errors. The web app calls `API_URL` from `apps/web/lib/api.ts`:
  - `NEXT_PUBLIC_API_URL` set to an absolute URL: that API. `apps/web/.env.development` sets `http://localhost:4000` for `pnpm dev`.
  - Unset (any plain `next build`, Vercel, the deploy button): **demo mode**, served by route handlers in `apps/web/app/api/` backed by `apps/web/lib/demo-api/store.ts`, an in-memory port of the NestJS services.
  - **When you add or change an endpoint in `apps/api`, make the same change in `apps/web/lib/demo-api/store.ts` and add a route handler under `apps/web/app/api/`**, plus a test in `apps/web/lib/demo-api/__tests__/routes.test.ts`. Same path, request/response shape and error messages.
- **States:** Every screen handles the states in its state matrix (loading, empty, error, success and the rest). Missing error and empty states are the most common miss.
- **Accessibility:** Labels on every input, keyboard access, visible focus, errors announced. See `docs/accessibility-rules.md`.
- **Types:** TypeScript `strict` with `noUncheckedIndexedAccess`. No `any`.
- **Formatting:** Prettier (no semicolons, double quotes, trailing commas `es5`, Tailwind class sorting). Some older files use single quotes and semicolons; match the file you are editing.
- **Naming:** components kebab-case (`login-form.tsx`), slices camelCase + `Slice` (`authSlice.ts`), Nest files `{name}.controller.ts` / `{name}.service.ts` / `{name}.module.ts`.
- **Tests:** Vitest + Testing Library, in `__tests__/` next to the code, named `*.test.ts(x)`.

## Before you finish

- [ ] The feature has a spec and state matrix in `packages/specs/`
- [ ] The relevant review checklists pass
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass
- [ ] New routes render (CI curls every route in `.github/workflows/ci.yml`; add yours there)
- [ ] `examples/{feature}/review.md` notes what you fixed
