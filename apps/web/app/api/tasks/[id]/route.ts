// DEMO MODE: mirrors the NestJS API (apps/api) with in-memory data. See lib/api.ts.
import { handle, readJson } from "@/lib/demo-api/http"
import { deleteTask, updateTask, type Task } from "@/lib/demo-api/store"

export const dynamic = "force-dynamic"

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params
  return handle(async () => updateTask(id, await readJson<Task>(request)))
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params
  return handle(() => deleteTask(id))
}
