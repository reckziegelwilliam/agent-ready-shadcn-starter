// DEMO MODE: mirrors the NestJS API (apps/api) with in-memory data. See lib/api.ts.
import { handle, readJson } from "@/lib/demo-api/http"
import {
  createUpload,
  listUploads,
  type UploadedFile,
} from "@/lib/demo-api/store"

export const dynamic = "force-dynamic"

export function GET() {
  return handle(() => listUploads())
}

export function POST(request: Request) {
  return handle(
    async () => createUpload(await readJson<UploadedFile>(request)),
    201
  )
}
