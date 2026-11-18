// DEMO MODE: mirrors the NestJS API (apps/api) with in-memory data. See lib/api.ts.
import { handle, readJson } from "@/lib/demo-api/http"
import { register } from "@/lib/demo-api/store"

export const dynamic = "force-dynamic"

export function POST(request: Request) {
  return handle(async () => register(await readJson(request)), 201)
}
