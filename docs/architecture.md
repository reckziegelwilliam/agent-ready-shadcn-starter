# Architecture Overview

This document describes how the agent-ready-shadcn-starter monorepo is organized, how the pieces connect, and the conventions that keep everything consistent.

## Monorepo structure

The project uses **Turborepo** for build orchestration and **pnpm workspaces** for dependency management. There are three workspace roots:

```
apps/       -- Deployable applications
packages/   -- Shared libraries and content
examples/   -- Feature example documentation
```

### Apps

#### `apps/web` -- Next.js 16 Frontend

The primary frontend application.

- **Framework**: Next.js 16 with App Router and Turbopack
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss`
- **Components**: shadcn/ui from the shared `@workspace/ui` package
- **State**: Redux Toolkit with feature-based slices
- **Forms**: React Hook Form + Zod validation
- **Theming**: `next-themes` for light/dark mode

**Directory layout:**

```
apps/web/
├── app/                  # App Router pages and layouts
│   ├── (auth)/           # Auth route group (login, signup, forgot-password)
│   ├── dashboard/        # Data table example
│   ├── settings/         # Settings example
│   ├── wizard/           # Multi-step wizard example
│   ├── items/            # Optimistic CRUD example
│   ├── upload/           # File upload example
│   ├── compare/          # Before/after repair viewer
│   ├── quality/          # Quality dashboard
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Landing page
├── components/           # Feature components, one folder per feature
│   ├── auth/  dashboard/  settings/  wizard/  tasks/  upload/
│   ├── compare/  quality/  landing/
│   └── nav.tsx, theme-provider.tsx, ...
├── features/             # Redux slices, one folder per domain
│   └── auth/ settings/ wizard/ tasks/ uploads/   # {name}Slice.ts + __tests__/
├── hooks/                # Custom React hooks
└── lib/                  # Utilities
    ├── store/            # Redux store (store.ts), typed hooks (hooks.ts), provider
    ├── mock-data/        # Mock data for the dashboard table
    ├── comparisons/      # Data for the /compare viewer
    └── quality-data.ts   # Data for the /quality dashboard
```

#### `apps/api` -- NestJS 11 Backend

The backend API service.

- **Framework**: NestJS 11 with Express
- **Architecture**: Module-based with controllers and services
- **Port**: 4000 (development)

**Directory layout:**

```
apps/api/
└── src/
    ├── auth/             # Auth module (controller, service)
    ├── tasks/            # Optimistic CRUD example
    ├── settings/         # Settings example
    ├── onboarding/       # Wizard submit endpoint
    ├── uploads/          # File upload example
    ├── health/           # Health check endpoint
    ├── app.module.ts     # Root module that imports all feature modules
    └── main.ts           # Application entry point
```

### Packages

#### `packages/ui` -- Shared Component Library

Houses all shadcn/ui components used across the monorepo.

- Components live in `src/components/`
- Shared hooks in `src/hooks/`
- Utility functions (like `cn()`) in `src/lib/`
- Global styles and Tailwind config in `src/styles/`

Apps import components as:

```tsx
import { Button } from "@workspace/ui/components/button";
```

#### `packages/prompts` -- AI Prompt Packs

Reusable, structured prompts for AI coding agents. These provide context, instructions, and verification criteria that produce better AI output than ad-hoc requests.

#### `packages/specs` -- Feature Specifications

Templates and completed specs that define what to build before prompting an AI agent.

#### `packages/review-checklists` -- Production Review Checklists

Checklists for reviewing AI-generated code against production standards.

#### `packages/eslint-config` -- Shared ESLint Config

Centralized ESLint configuration with presets for Next.js, Node, and React libraries.

#### `packages/typescript-config` -- Shared TypeScript Config

Base `tsconfig.json` files extended by all apps and packages. Includes presets for Next.js, NestJS, and React libraries.

### Examples

Each directory in `examples/` documents a complete feature lifecycle:

```
examples/auth-flow/
├── README.md            # Overview, key patterns, and a listing of the real files
└── review.md            # What AI got wrong and how it was corrected
```

The spec and state matrix for each example live in `packages/specs/` (`{feature}.md`, `{feature}-states.md`), the prompt pack in `packages/prompts/build-{feature}.md`, and the implementation code in `apps/`. Examples only contain documentation. `pnpm turbo gen feature` scaffolds all of these for a new feature.

## Data flow

```
User -> Next.js (App Router) -> Redux Store -> API (NestJS)
                                    |
                              React Components
                                    |
                              shadcn/ui (packages/ui)
```

### Frontend state management

The app uses Redux Toolkit with a feature-based slice architecture:

1. **Slices** define state shape, reducers, and async thunks per domain
2. **Store** is configured in `lib/store/` with typed hooks
3. **Components** use typed `useAppSelector` and `useAppDispatch` hooks
4. **Async operations** use RTK's `createAsyncThunk` for API calls

### API communication

The NestJS backend exposes RESTful endpoints. The frontend communicates via:

- RTK async thunks for data fetching
- Standard `fetch` against `API_URL` from `apps/web/lib/api.ts`

When `NEXT_PUBLIC_API_URL` is unset (or a same-origin path), `API_URL` is `/api` and requests go to **demo-mode route handlers** in `apps/web/app/api/`. They are backed by `apps/web/lib/demo-api/store.ts`, an in-memory port of the NestJS services with the same paths, payloads, error bodies and simulated latency/failures, so the web app runs on its own (e.g. on Vercel). `apps/web/.env.development` points `next dev` at the NestJS API on port 4000.

## Build pipeline

Turborepo manages the build graph defined in `turbo.json`:

```
build   -- Depends on upstream builds (^build)
lint    -- Depends on upstream lints (^lint)
typecheck -- Depends on upstream typechecks (^typecheck)
test    -- Runs Vitest in apps/web and apps/api
dev     -- No caching, persistent (long-running)
```

Build outputs:
- `apps/web`: `.next/` directory
- `apps/api`: `dist/` directory
- Packages: consumed directly via workspace protocol

## Conventions

### Import aliases

- `@workspace/ui` -- shared UI components
- `@workspace/eslint-config` -- ESLint presets
- `@workspace/typescript-config` -- TypeScript presets

### File naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | kebab-case | `login-form.tsx` |
| Redux slices | camelCase + Slice | `authSlice.ts` |
| Utilities | kebab-case | `format-date.ts` |
| Pages | Next.js conventions | `page.tsx`, `layout.tsx` |
| NestJS files | kebab-case with suffix | `auth.controller.ts`, `auth.service.ts` |

### Route groups

Next.js route groups (parenthesized directories) organize related pages without affecting the URL structure. For example, `(auth)` groups login, signup, and forgot-password pages.

### Feature isolation

Each feature owns its:
- Redux slice in `features/{name}/`
- Components in `components/{name}/`
- API module in `apps/api/src/{name}/`

This keeps features self-contained and easy to understand, modify, or remove.
