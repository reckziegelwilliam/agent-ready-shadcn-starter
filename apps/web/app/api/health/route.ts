// DEMO MODE: mirrors the NestJS API (apps/api) with in-memory data. See lib/api.ts.
import { json } from "@/lib/demo-api/http"

export const dynamic = "force-dynamic"

export function GET() {
  return json({ status: "ok", timestamp: new Date().toISOString(), demo: true })
}
