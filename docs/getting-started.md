# Getting Started

This guide walks you through setting up the agent-ready-shadcn-starter monorepo, running the development servers, and understanding the project layout.

## Prerequisites

- **Node.js** >= 20 ([download](https://nodejs.org/))
- **pnpm** 9.x ([install](https://pnpm.io/installation))
- **Git**

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/reckziegelwilliam/agent-ready-shadcn-starter.git
cd agent-ready-shadcn-starter
```

### 2. Install dependencies

```bash
pnpm install
```

This installs all dependencies across the monorepo: the Next.js frontend, the NestJS backend, the shared UI package, and all tooling.

### 3. Start development servers

```bash
pnpm dev
```

This runs Turborepo in dev mode, which starts:

| Service | URL | Description |
|---------|-----|-------------|
| Web | http://localhost:3000 | Next.js 16 frontend with Turbopack |
| API | http://localhost:4000 | NestJS 11 backend API |

Both servers support hot reload. Changes to shared packages (like `packages/ui`) will propagate to both apps.

## Verifying the setup

1. Open http://localhost:3000 -- you should see the web app
2. Open http://localhost:4000/health -- you should see a health check response

## Common commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Run ESLint across the monorepo |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run the Vitest suites in `apps/web` and `apps/api` |
| `pnpm turbo gen feature` | Scaffold a new feature (spec, state matrix, prompt, example docs, page) |
| `pnpm format` | Format code with Prettier |

## Adding shadcn/ui components

To add a new shadcn/ui component to the shared UI package:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This places the component in `packages/ui/src/components/`. Import it in your app:

```tsx
import { Button } from "@workspace/ui/components/button";
```

## Project layout

The monorepo has three workspace roots defined in `pnpm-workspace.yaml`:

- **`apps/*`** -- Deployable applications (web frontend, API backend)
- **`packages/*`** -- Shared libraries (UI components, configs, prompts, specs, checklists)
- **`examples/*`** -- Feature example documentation (specs, prompts, review notes)

See [architecture.md](architecture.md) for a deeper dive into how the pieces fit together.

## Environment variables

The web app reads one variable, `NEXT_PUBLIC_API_URL`:

| Value | What the web app calls |
|-------|------------------------|
| An absolute URL, e.g. `http://localhost:4000` | That API (normally the NestJS app in `apps/api`) |
| Unset, or a same-origin path like `/api` | **Demo mode**: built-in route handlers in `apps/web/app/api/` with in-memory mock data that mirror the NestJS API |

`apps/web/.env.development` (committed, used only by `next dev`) sets `http://localhost:4000`, so `pnpm dev` runs full stack. A production `next build` without the variable (Vercel, the deploy button) runs in demo mode. Sign in there with `demo@example.com` / `password123`.

To try demo mode locally, run `pnpm --filter web build && pnpm --filter web start`, or comment out the line in `.env.development`. To point a deployment at a hosted API, set the variable in the host's environment settings (or in `apps/web/.env.local` locally); it is inlined at build time, so redeploy after changing it.

`.env`, `.env.local` and `.env.*.local` are gitignored; `apps/web/.env.development` is committed because it holds no secrets. Never commit secrets.

## Troubleshooting

### `pnpm install` fails

Make sure you are using pnpm 9.x. Check with `pnpm --version`. If you have an older version:

```bash
corepack enable
corepack prepare pnpm@9.15.9 --activate
```

### Port already in use

If port 3000 or 4000 is taken, kill the existing process:

```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

### TypeScript errors after pulling

Clear Turborepo cache and rebuild:

```bash
rm -rf .turbo node_modules/.cache
pnpm install
pnpm build
```

## Using it with an AI agent

Open the repo in Cursor, Claude Code, or Codex and describe what you want to build. [`AGENTS.md`](../AGENTS.md) (imported by `CLAUDE.md`) tells the agent to pick the closest example, write a spec, follow the prompt pack, and run the review checklists. `.mcp.json` and `.cursor/mcp.json` register the shadcn MCP server.

## Next steps

- Read the [architecture overview](architecture.md)
- Learn [how to use this repo with Claude](how-to-use-with-claude.md)
- Browse the feature examples in `examples/`
- Review the [production review rubric](production-review-rubric.md)
