// DEMO MODE: mirrors the NestJS API (apps/api) with in-memory data. See lib/api.ts.
import { handle } from "@/lib/demo-api/http"
import { deleteUpload } from "@/lib/demo-api/store"

export const dynamic = "force-dynamic"

type Context = { params: Promise<{ id: string }> }

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params
  return handle(() => deleteUpload(id))
}
