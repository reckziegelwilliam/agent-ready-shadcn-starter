// DEMO MODE: mirrors the NestJS API (apps/api) with in-memory data. See lib/api.ts.
import { handle, readJson } from "@/lib/demo-api/http"
import { createTask, listTasks, type Task } from "@/lib/demo-api/store"

export const dynamic = "force-dynamic"

export function GET() {
  return handle(() => listTasks())
}

export function POST(request: Request) {
  return handle(async () => createTask(await readJson<Task>(request)), 201)
}
