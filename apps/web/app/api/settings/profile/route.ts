// DEMO MODE: mirrors the NestJS API (apps/api) with in-memory data. See lib/api.ts.
import { handle, readJson } from "@/lib/demo-api/http"
import { updateProfile } from "@/lib/demo-api/store"

export const dynamic = "force-dynamic"

export function PATCH(request: Request) {
  return handle(async () => updateProfile(await readJson(request)))
}
