# Getting Started

This guide walks you through setting up the agent-ready-shadcn-starter monorepo, running the development servers, and understanding the project layout.

## Prerequisites

- **Node.js** >= 20 ([download](https://nodejs.org/))
- **pnpm** 9.x ([install](https://pnpm.io/installation))
- **Git**

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/agent-ready-shadcn-starter.git
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

Copy the example env file if one exists, or create `.env.local` in the app directory:

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Environment files (`.env*`) are gitignored. Never commit secrets.

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

## Next steps

- Read the [architecture overview](architecture.md)
- Learn [how to use this repo with Claude](how-to-use-with-claude.md)
- Browse the feature examples in `examples/`
- Review the [production review rubric](production-review-rubric.md)
