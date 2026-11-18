// DEMO MODE: mirrors the NestJS API (apps/api) with in-memory data. See lib/api.ts.
import { handle } from "@/lib/demo-api/http"
import { getSettings } from "@/lib/demo-api/store"

export const dynamic = "force-dynamic"

export function GET() {
  return handle(() => getSettings())
}
