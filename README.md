# agent-ready-shadcn-starter

> Production-grade starter and playbook for shipping shadcn/ui + Tailwind + Redux Toolkit + NestJS features from specs using AI coding agents.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## Why this exists

AI coding agents can generate UI quickly. They usually do not generate production-ready product code. Forms miss validation states. Tables lack empty and error handling. Accessibility is an afterthought. State management is bolted on instead of designed.

This repo shows how to:

- **Go from spec to implementation** with structured prompts
- **Give agents the right context** so they produce better output on the first pass
- **Review and harden AI-generated code** against a production checklist
- **Ship polished features faster** by fixing patterns instead of symptoms

## What's inside

- **Next.js 16** + shadcn/ui + Tailwind v4 frontend
- **NestJS 11** backend API
- **Redux Toolkit** patterns for real app state management
- **Reusable prompt packs** for AI coding agents
- **Production review checklists** for hardening AI output
- **Copyable feature examples** with specs, prompts, and review notes

## Quick start

```bash
git clone https://github.com/YOUR_USERNAME/agent-ready-shadcn-starter.git
cd agent-ready-shadcn-starter
pnpm install
pnpm dev
```

| Service | URL |
|---------|-----|
| Web (Next.js) | http://localhost:3000 |
| API (NestJS) | http://localhost:4000 |

## Feature examples

| Example | Status | Description |
|---------|--------|-------------|
| Auth Flow | Done | Login, signup, forgot password with validation |
| Dashboard Table | Done | Sortable, filterable, paginated data table |
| Settings Page | Planned | Tabs, toggles, form save state |
| Multi-step Wizard | Planned | Step validation, progress indicator, review step |
| Optimistic CRUD | Planned | Create/edit/delete with optimistic updates and rollback |
| File Upload | Planned | Drag and drop, preview, progress tracking |

Each example includes a **spec**, a **prompt pack**, the **final implementation**, and **review notes** showing what the AI got wrong and how it was corrected.

## Repo structure

```
agent-ready-shadcn-starter/
├── apps/
│   ├── web/                        # Next.js 16 frontend
│   │   ├── app/                    # App router pages
│   │   │   ├── (auth)/             # Auth route group (login, signup, forgot-password)
│   │   │   └── dashboard/          # Dashboard pages
│   │   ├── components/             # Feature-specific React components
│   │   │   ├── auth/               # Auth form components
│   │   │   └── dashboard/          # Dashboard UI components
│   │   ├── features/               # Redux slices (feature-based state)
│   │   │   └── auth/               # Auth slice with RTK
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── lib/                    # Utilities, store config, mock data
│   │   │   ├── store/              # Redux store setup
│   │   │   └── mock-data/          # Development mock data
│   │   └── package.json
│   └── api/                        # NestJS 11 backend
│       └── src/
│           ├── auth/               # Auth module, controller, service
│           ├── health/             # Health check endpoint
│           ├── app.module.ts       # Root module
│           └── main.ts             # Entry point
├── packages/
│   ├── ui/                         # Shared shadcn/ui component library
│   │   └── src/
│   │       ├── components/         # shadcn/ui components (button, input, etc.)
│   │       ├── hooks/              # Shared hooks
│   │       ├── lib/                # Utility functions (cn, etc.)
│   │       └── styles/             # Global CSS with Tailwind v4
│   ├── prompts/                    # Reusable AI prompt packs
│   │   └── general/               # General-purpose prompts
│   ├── specs/                      # Feature specifications
│   ├── review-checklists/          # Production review checklists
│   ├── eslint-config/              # Shared ESLint configuration
│   └── typescript-config/          # Shared TypeScript configs
├── examples/                       # Complete feature examples
│   ├── auth-flow/                  # Auth: spec + prompts + review notes
│   ├── dashboard-table/            # Data table: spec + prompts + review notes
│   ├── settings-page/              # (planned)
│   ├── multi-step-wizard/          # (planned)
│   ├── optimistic-crud/            # (planned)
│   └── file-upload/                # (planned)
├── docs/                           # Documentation
├── public/                         # Static assets
│   ├── screenshots/                # Feature screenshots
│   └── demo-gifs/                  # Demo recordings
├── turbo.json                      # Turborepo pipeline config
├── pnpm-workspace.yaml             # pnpm workspace definition
└── package.json                    # Root package with turbo scripts
```

## Prompt packs

Reusable prompts for AI coding agents. These are not just "generate a login form" -- they provide structured context, step-by-step implementation instructions, and verification criteria.

| Pack | Purpose |
|------|---------|
| `packages/prompts/general/` | General-purpose prompts for common patterns |
| `examples/auth-flow/` | Auth-specific prompts with form validation context |
| `examples/dashboard-table/` | Data table prompts with sorting/filtering context |

Each prompt pack includes:

1. **System context** -- tech stack, conventions, file locations
2. **Implementation steps** -- ordered tasks with acceptance criteria
3. **Verification checklist** -- what to check before considering it done

## Production review rubric

After AI generates code, run it through these checklists:

- **Accessibility** -- ARIA labels, keyboard navigation, focus management, screen reader support
- **States** -- Loading, empty, error, success, partial data, offline
- **Types** -- Strict TypeScript, no `any`, discriminated unions for state
- **Responsive** -- Mobile-first, breakpoint testing, touch targets
- **Performance** -- Bundle size, re-renders, memoization, lazy loading
- **Security** -- Input sanitization, CSRF, auth checks, rate limiting

See [`docs/production-review-rubric.md`](docs/production-review-rubric.md) for the full rubric.

## Tech stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | React framework with App Router |
| React | 19 | UI library |
| shadcn/ui | latest | Component primitives |
| Tailwind CSS | v4 | Utility-first styling |
| Redux Toolkit | 2.x | State management |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Schema validation |
| NestJS | 11 | Backend API framework |
| Turborepo | 2.x | Monorepo build system |
| pnpm | 9.x | Package manager |
| TypeScript | 5.9 | Type safety |

## Philosophy

AI-assisted development works best when you:

1. **Start with a clear spec.** Define what you are building before asking the agent to build it.
2. **Give the agent structured context.** File paths, conventions, existing patterns, and constraints.
3. **Review output against a checklist.** Not vibes -- a concrete list of production requirements.
4. **Fix patterns, not just symptoms.** When AI gets something wrong, update the prompt so it gets it right next time.

This repo codifies that workflow into something you can clone, use, and extend.

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding feature examples, writing specs, creating prompt packs, and the PR process.

## License

[MIT](LICENSE)
