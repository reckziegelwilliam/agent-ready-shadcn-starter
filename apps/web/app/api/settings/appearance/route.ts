// DEMO MODE: mirrors the NestJS API (apps/api) with in-memory data. See lib/api.ts.
import { handle, readJson } from "@/lib/demo-api/http"
import { updateAppearance } from "@/lib/demo-api/store"

export const dynamic = "force-dynamic"

export function PATCH(request: Request) {
  return handle(async () => updateAppearance(await readJson(request)))
}
