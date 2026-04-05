# Build File Upload

> Target spec: `packages/specs/file-upload.md`
> Difficulty: Medium-High

## Context

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **State management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **UI components:** Imported from `@workspace/ui/components/` (shadcn/ui primitives)
- **Toasts:** `sonner` (import `{ toast }` from `"sonner"`)
- **Icons:** `lucide-react`
- **Routing:** Next.js App Router file-based routing
- **Feature directory:** `apps/web/features/uploads/` for the Redux slice
- **Components directory:** `apps/web/components/upload/` for UI components
- **Page directory:** `apps/web/app/upload/` for the route

## Input

1. Read the full spec: `packages/specs/file-upload.md`
2. Read the state matrix: `packages/specs/file-upload-states.md`
3. Review the settings slice for conventions: `apps/web/features/settings/settingsSlice.ts`
4. Check the Redux store: `apps/web/lib/store/store.ts`
5. Review the settings API module: `apps/api/src/settings/` (controller, service, module pattern)

## Instructions

### 1. Build the NestJS API Module

Create the uploads API with in-memory mock data and simulated failures.

- **Directory:** `apps/api/src/uploads/`
- Create `uploads.service.ts` with:
  - An in-memory array of 3 demo uploaded files.
  - `getUploadedFiles()` -- returns all files after a short delay (600-800ms).
  - `uploadFile(data)` -- accepts `{ name, size, type }`, simulates 1-3s delay, returns a new `UploadedFile`. Has a 15% random failure rate (throws an error).
  - `deleteFile(id)` -- removes a file by ID after a short delay.
  - A `delay()` helper for simulating network latency.
- Create `uploads.controller.ts` with three endpoints:
  - `GET /uploads` -- returns uploaded files list
  - `POST /uploads` -- simulates file upload with metadata (JSON body, NOT multipart). Returns 201 on success, 500 on simulated failure.
  - `DELETE /uploads/:id` -- removes an uploaded file
- Create `uploads.module.ts` registering the controller and service.
- Register `UploadsModule` in `apps/api/src/app.module.ts`.

**IMPORTANT:** The POST endpoint accepts JSON metadata `{ name, size, type }`, NOT actual FormData/file binary. This is a simulation.

### 2. Build the Redux Slice

Create the uploads slice with per-file status tracking.

- **File:** `apps/web/features/uploads/uploadsSlice.ts`
- Export validation constants: `ACCEPTED_IMAGE_TYPES`, `ACCEPTED_DOCUMENT_TYPES`, `ACCEPTED_FILE_TYPES`, `MAX_FILE_SIZE` (10 MB), `MAX_FILE_COUNT` (5).
- Types: `FileUpload` (id, file metadata, status, progress, error, previewUrl), `UploadedFile` (id, name, size, type, uploadedAt).
- State shape: `{ files: FileUpload[], uploadedFiles: UploadedFile[], fetchStatus, fetchError }`
- Synchronous actions:
  - `addFiles` -- adds file entries with status `'queued'` and progress `0`.
  - `removeFile` -- removes a file by ID.
  - `clearCompleted` -- removes files with status `'complete'`.
  - `resetAll` -- clears all files from queue.
  - `updateFileProgress` -- updates progress for a specific file (used by the upload thunk).
- Async thunks:
  - `uploadFile(fileId)` -- Finds the file in state, simulates progress updates using `setInterval` (increment by 5-15% every 200ms, cap at 90%), then POSTs to API. On success, sets progress to 100 and status to `'complete'`, adds to `uploadedFiles`. On failure, sets status to `'failed'` with error message.
  - `fetchUploadedFiles` -- GETs uploaded files from API.
  - `deleteUploadedFile(id)` -- DELETEs a file from API, removes from state on success.

**IMPORTANT:** Progress simulation uses `setInterval` inside the thunk, dispatching `updateFileProgress` to update Redux state incrementally. The progress bar in the UI uses CSS `transition-all duration-300 ease-out` for smooth visual animation.

### 3. Register the Slice

Add `uploadsReducer` to the Redux store.

- **File:** `apps/web/lib/store/store.ts`
- Import `uploadsReducer` from `@/features/uploads/uploadsSlice`
- Add it under the `uploads` key in the reducer map.
- **Do not remove existing reducers.**

### 4. Build the Upload Zone

- **File:** `apps/web/components/upload/upload-zone.tsx`
- **Must include** `"use client"` at the top.
- Drag-and-drop area with dashed border (`border-2 border-dashed`).
- **Drag-over visual feedback:** Change border to `border-primary` and background to `bg-primary/5` when `isDragOver` is true. Use `cn()` for conditional classes.
- **Counter-based drag tracking:** Use a `dragCounter` ref (not state) that increments on `dragenter` and decrements on `dragleave`. Set `isDragOver` to true when counter goes from 0 to 1, false when it returns to 0. This prevents flicker from nested elements.
- **Click fallback:** Hidden `<input type="file" ref={fileInputRef} />`. Click on zone triggers `fileInputRef.current?.click()`.
- **File validation in `validateAndAddFiles`:**
  1. Calculate remaining slots: `MAX_FILE_COUNT - activeFileCount` (count files with status `'queued'` or `'uploading'`).
  2. If remaining is 0, show toast error and return.
  3. Slice selected files to remaining count, showing toast if excess.
  4. For each file: check type against `ACCEPTED_FILE_TYPES`, check size against `MAX_FILE_SIZE`. Reject with toast error.
  5. For valid image files, create preview URL with `URL.createObjectURL(file)`.
  6. Dispatch `addFiles` with valid files.
- **Disabled state:** When active file count >= `MAX_FILE_COUNT`, apply `cursor-not-allowed opacity-50` and prevent all interactions.
- **Accessibility:** `role="button"`, `tabIndex={0}`, keyboard handler for Enter/Space.

### 5. Build the File Preview Card

- **File:** `apps/web/components/upload/file-preview-card.tsx`
- **Must include** `"use client"` at the top.
- Layout: thumbnail (12x12), file info (name, size, type badge), status icon, action buttons.
- **Image preview:** If file type is image and `previewUrl` exists, render `<img>` with `object-cover`. Otherwise, render `FileText` icon.
- **Preview URL cleanup:** Store `previewUrl` in a ref. In `useEffect` cleanup, call `URL.revokeObjectURL(url)` if it exists.
- **Progress bar:** Only shown when `status === 'uploading'`. Outer div with `bg-muted rounded-full h-1.5`. Inner div with `bg-primary rounded-full transition-all duration-300 ease-out` and `style={{ width: \`${progress}%\` }}`.
- **Status icons:** `Clock` for queued, `CheckCircle2` (green) for complete, `XCircle` (red) for failed.
- **Action buttons:**
  - Retry button: Only shown when `status === 'failed'`. Calls `onRetry(file.id)`.
  - Remove button: Shown for all statuses EXCEPT `'uploading'`. Calls `onRemove(file.id)`.
- **Error display:** When `status === 'failed'` and `error` exists, show error text in `text-destructive`.

### 6. Build the Upload List

- **File:** `apps/web/components/upload/upload-list.tsx`
- **Must include** `"use client"` at the top.
- Renders nothing when `files.length === 0`.
- Header with file count and action buttons.
- **"Upload All" button:** Visible when any file has `status === 'queued'`. Disabled when any file has `status === 'uploading'`. On click, dispatches `uploadFile` for each queued file.
- **"Clear Completed" button:** Visible when any file has `status === 'complete'`. Dispatches `clearCompleted`.
- Renders a `FilePreviewCard` for each file.
- Passes `handleRemove` (dispatches `removeFile`) and `handleRetry` (dispatches `uploadFile`) as callbacks.

### 7. Build the Uploaded Files Table

- **File:** `apps/web/components/upload/uploaded-files-table.tsx`
- **Must include** `"use client"` at the top.
- Three states: loading (skeleton rows), error (error message), loaded (table or empty message).
- Uses shadcn `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`.
- Columns: Name, Size (formatted), Date (formatted), Delete button.
- Delete dispatches `deleteUploadedFile` and shows toast on success/failure.

### 8. Build the Upload Page Loading Skeleton

- **File:** `apps/web/components/upload/upload-page-loading.tsx`
- Server component (no "use client" needed since it only uses `Skeleton`).
- Renders skeleton placeholders matching the page layout: upload zone area, file list area, table area.

### 9. Build the Upload Page

- **File:** `apps/web/app/upload/page.tsx`
- **Must include** `"use client"` at the top.
- Dispatches `fetchUploadedFiles` on mount via `useEffect`.
- Layout: title ("File Upload"), description, `Separator`, then `UploadZone`, `UploadList`, `UploadedFilesTable` in a vertical stack with `space-y-8`.
- Max width container (`max-w-2xl mx-auto`).

### 10. Write Tests

- **File:** `apps/web/features/uploads/__tests__/uploadsSlice.test.ts`
- Test initial state.
- Test `addFiles` -- adds files with queued status, appends to existing.
- Test `removeFile` -- removes by ID, handles non-existent ID.
- Test `clearCompleted` -- removes only complete files, keeps queued and failed.
- Test `resetAll` -- clears all files.
- Test `updateFileProgress` -- updates progress for specific file, rounds to integer.
- Test `uploadFile` pending -- sets status to uploading.
- Test `uploadFile` fulfilled -- sets status to complete, progress to 100, adds to uploadedFiles.
- Test `uploadFile` rejected -- sets status to failed, populates error.
- Test `fetchUploadedFiles` pending/fulfilled/rejected.
- Test validation constants (accepted types, max size, max count).

## Output

| File | Action | Description |
|------|--------|-------------|
| `apps/api/src/uploads/uploads.service.ts` | Create | In-memory upload store with delay and failure simulation |
| `apps/api/src/uploads/uploads.controller.ts` | Create | GET + POST + DELETE endpoints |
| `apps/api/src/uploads/uploads.module.ts` | Create | NestJS module |
| `apps/api/src/app.module.ts` | Modify | Register UploadsModule |
| `apps/web/features/uploads/uploadsSlice.ts` | Create | Redux slice with per-file tracking |
| `apps/web/lib/store/store.ts` | Modify | Add uploads reducer |
| `apps/web/components/upload/upload-zone.tsx` | Create | Drag & drop with validation |
| `apps/web/components/upload/file-preview-card.tsx` | Create | Per-file card with progress |
| `apps/web/components/upload/upload-list.tsx` | Create | File list with upload/clear actions |
| `apps/web/components/upload/uploaded-files-table.tsx` | Create | Previously uploaded files table |
| `apps/web/components/upload/upload-page-loading.tsx` | Create | Skeleton loading state |
| `apps/web/app/upload/page.tsx` | Create | Upload page route |
| `apps/web/features/uploads/__tests__/uploadsSlice.test.ts` | Create | Slice unit tests |

## Verification

1. **Type check:** `pnpm typecheck` passes with zero errors.
2. **Lint:** `pnpm lint` passes with zero errors.
3. **Tests:** `pnpm test` passes all uploads slice tests.
4. **Visual -- Drag & drop:** Drag a file over the zone. Verify border color changes. Drop. Verify file appears in list.
5. **Visual -- Click browse:** Click the zone. Verify file picker opens. Select a file. Verify it appears in list.
6. **Visual -- Validation:** Try uploading a .exe file. Verify toast error. Try a 20 MB file. Verify toast error. Add 6 files. Verify 6th is rejected.
7. **Visual -- Upload:** Click "Upload All." Verify progress bars animate smoothly. Verify some succeed (green checkmark) and some may fail (red X with retry).
8. **Visual -- Retry:** Click retry on a failed file. Verify only that file re-uploads.
9. **Visual -- Remove:** Remove a queued file. Remove a completed file. Verify remove button is hidden during upload.
10. **Visual -- Clear:** Click "Clear Completed." Verify completed files removed, failed/queued remain.
11. **Visual -- Table:** Verify previously uploaded files appear in table. Delete one. Verify it disappears.
12. **Memory:** Open DevTools Memory tab. Upload images. Remove them. Verify blob URLs are freed.
13. **Loading state:** Refresh page. Verify skeleton appears while table loads.
14. **Spec coverage:** Compare output against every acceptance criterion in `packages/specs/file-upload.md`.

## Common AI Mistakes to Watch For

1. **No drag-over visual feedback.** The zone must change appearance when files are dragged over it.
2. **No `dragCounter` for nested elements.** Simple `dragenter`/`dragleave` will flicker. Use a counter ref.
3. **Server-side only validation.** File type, size, and count must be validated client-side before adding to queue.
4. **Batch retry only.** Each failed file needs its own retry button.
5. **Jumpy progress bar.** Progress must increment smoothly, not jump from 0 to 100.
6. **No `URL.revokeObjectURL` cleanup.** Preview blob URLs must be revoked on unmount and removal.
7. **No max file count enforcement.** The upload zone must reject files beyond the limit.
8. **Remove button shown during upload.** Hide the remove button when status is `'uploading'` to prevent inconsistent state.
9. **Using actual FormData.** The API accepts JSON metadata, not file binaries.
10. **Button using `asChild`.** The shadcn Button in this project does NOT support `asChild`.
