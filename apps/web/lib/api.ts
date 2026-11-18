/**
 * Base URL for the backend API.
 *
 * - `NEXT_PUBLIC_API_URL` set to an absolute URL (e.g. `http://localhost:4000`):
 *   the web app talks to that API, normally the NestJS app in `apps/api`.
 *   `apps/web/.env.development` sets this for `pnpm dev`.
 * - Unset, or set to a same-origin path such as `/api`: the web app uses the
 *   built-in **demo API**, Next.js route handlers in `app/api/` that mirror
 *   the NestJS endpoints with in-memory mock data (see `lib/demo-api/`).
 *   This is what a plain `next build` (Vercel, the deploy button) uses.
 *
 * Next.js inlines `NEXT_PUBLIC_*` at build time, so this is decided per build.
 */
const configured = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "")

export const DEMO_API_BASE = "/api"

export const API_URL = configured || DEMO_API_BASE

/** True when requests go to the built-in demo route handlers (same origin). */
export const IS_DEMO_API = API_URL.startsWith("/")
