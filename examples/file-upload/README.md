# File Upload Example

> A file upload interface with drag-and-drop, per-file progress, preview thumbnails, and individual retry.

## What This Covers

This example demonstrates a file upload flow that handles the full lifecycle: file selection, validation, upload progress, success, failure, and retry. It exercises drag-and-drop event handling, client-side file validation, simulated upload progress, and blob URL memory management.

**Features implemented:**
- Drag-and-drop zone with visual feedback (border color change, background tint on drag-over)
- Click-to-browse fallback via hidden file input
- Client-side file type and size validation with toast error messages
- Max file count enforcement (5 files at once)
- Image thumbnail previews using `URL.createObjectURL` with cleanup on unmount
- Per-file progress bar with smooth CSS transitions
- Individual file retry for failed uploads
- Remove button at every state except during active upload
- "Upload All" button for batch upload of queued files
- "Clear Completed" button to clean up finished uploads
- Previously uploaded files table with delete capability
- Skeleton loading state while fetching uploaded files from API

**Key patterns demonstrated:**
- Counter-based `dragenter`/`dragleave` handling to prevent flicker on nested elements
- Client-side validation before files enter the Redux store (not relying on server rejection)
- Simulated progress using `setInterval` with incremental random updates capped at 90%
- `URL.revokeObjectURL` cleanup in `useEffect` return to prevent memory leaks
- Per-file async thunks with status tracked individually in Redux state
- Upload zone disabled state when max file count is reached

## File Structure

```
packages/specs/file-upload.md              # Feature spec
packages/specs/file-upload-states.md       # State matrix
packages/prompts/build-file-upload.md      # Build prompt
apps/api/src/uploads/                      # NestJS API module
  uploads.module.ts
  uploads.controller.ts
  uploads.service.ts
apps/web/features/uploads/
  uploadsSlice.ts                          # Redux slice
  __tests__/uploadsSlice.test.ts           # Slice tests
apps/web/components/upload/
  upload-zone.tsx                          # Drag & drop zone
  file-preview-card.tsx                    # Per-file card
  upload-list.tsx                          # File list with actions
  uploaded-files-table.tsx                 # Previously uploaded files
  upload-page-loading.tsx                  # Skeleton loading
apps/web/app/upload/page.tsx               # Page route
```

## Running

1. Start the API: `cd apps/api && pnpm dev` (runs on port 4000)
2. Start the web app: `cd apps/web && pnpm dev`
3. Navigate to `/upload`

The API simulates upload delays (1-3 seconds) and has a 15% random failure rate to exercise the retry flow.

## Common AI Mistakes

See `review.md` for a detailed post-implementation review covering six common mistakes AI agents make when building this feature:

1. No drag-over visual feedback
2. No client-side file validation before upload
3. No individual file retry (only batch retry)
4. Progress bar jumps from 0 to 100 (no smooth animation)
5. Preview blob URLs not cleaned up (memory leak)
6. No max file count enforcement
