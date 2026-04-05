# State Matrix: File Upload

> Documents every user-facing state across the file upload page. States marked "Not implemented" are known gaps.

## Upload Zone

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Idle** | No interaction | Dashed border, cloud icon, instruction text | Default render | Done |
| **Drag-over** | File dragged over zone | Primary border color, tinted background, icon animates | `isDragOver` state from dragenter/dragleave | Done |
| **Drag-leave** | File dragged away | Returns to idle appearance | `isDragOver` set false on dragleave | Done |
| **Drop (valid)** | Valid files dropped | Files added to queue, zone returns to idle | Validate then dispatch `addFiles` | Done |
| **Drop (invalid type)** | Wrong file type dropped | Toast error, file rejected | Client-side type check before dispatch | Done |
| **Drop (too large)** | Oversized file dropped | Toast error, file rejected | Client-side size check before dispatch | Done |
| **Drop (too many)** | Exceeds max file count | Toast error, excess files rejected | Count check before dispatch | Done |
| **Click** | User clicks zone | Native file picker opens | Hidden input triggered via ref | Done |
| **Disabled** | 5 files already queued/uploading | Zone visually muted, click/drop disabled | Disabled when active file count >= 5 | Done |
| **Nested drag** | Drag over child element causes flicker | Counter-based dragenter/dragleave prevents flicker | `dragCounter` ref incremented/decremented | Done |

## Per-File Card

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Queued** | File added, upload not started | File name, size, type badge, "Queued" badge, remove button | `status === 'queued'` | Done |
| **Uploading** | Upload thunk dispatched | Progress bar filling, percentage text | `status === 'uploading'`, `progress` updates | Done |
| **Upload progress** | Simulated progress updates | Smooth progress bar animation | `setInterval` with incremental updates | Done |
| **Complete** | Upload API returned success | Green checkmark, "Complete" badge, remove button | `status === 'complete'` | Done |
| **Failed** | Upload API returned error | Red X, "Failed" badge, error text, retry + remove buttons | `status === 'failed'`, `error` populated | Done |
| **Retry** | User clicked retry on failed file | Re-enters uploading state | Dispatch `uploadFile` again for this file | Done |
| **Image preview** | File is an image type | Thumbnail from `URL.createObjectURL` | `previewUrl` set on add, revoked on remove/unmount | Done |
| **Document icon** | File is not an image | Generic file icon | Fallback when no `previewUrl` | Done |
| **Preview cleanup** | Component unmounts or file removed | No visible change, memory freed | `URL.revokeObjectURL` in cleanup | Done |
| **Remove (queued)** | User removes queued file | Card removed from list | Dispatch `removeFile`, revoke preview URL | Done |
| **Remove (complete)** | User removes completed file | Card removed from list | Dispatch `removeFile` | Done |
| **Remove (failed)** | User removes failed file | Card removed from list | Dispatch `removeFile` | Done |
| **Remove during upload** | User tries to remove uploading file | No remove button shown during upload | Button hidden when `status === 'uploading'` | Done |

## Upload List

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Empty** | No files in queue | Nothing rendered (zone only) | `files.length === 0` | Done |
| **Has queued** | One or more queued files | File cards + "Upload All" button | Filter by `status === 'queued'` | Done |
| **Uploading** | One or more files uploading | Progress bars animating, "Upload All" disabled | Any file with `status === 'uploading'` | Done |
| **All complete** | All files finished successfully | All cards show checkmark, "Clear Completed" button | All files `status === 'complete'` | Done |
| **Partial failure** | Some complete, some failed | Mixed cards, "Clear Completed" + retry on failed | Mixed statuses | Done |
| **All failed** | All files failed | All cards show X and retry buttons | All files `status === 'failed'` | Done |
| **After clear** | User clicked "Clear Completed" | Completed cards removed, failed/queued remain | Dispatch `clearCompleted` | Done |

## Uploaded Files Table

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Loading** | GET /uploads in flight | Skeleton table rows | `fetchStatus === 'loading'` | Done |
| **Loaded (with files)** | API returned files | Table with name, size, date, delete button | `fetchStatus === 'succeeded'`, files populated | Done |
| **Loaded (empty)** | API returned empty array | "No files uploaded yet." message | `uploadedFiles.length === 0` | Done |
| **Error (fetch)** | GET /uploads failed | Error message with retry button | `fetchStatus === 'failed'` | Done |
| **Delete** | User clicked delete on a row | Row removed from table | Dispatch delete thunk, filter from state | Done |
| **Delete error** | DELETE /uploads/:id failed | Error toast, row remains | Toast error on rejection | Done |
| **Network error** | No connectivity | Generic fetch error | Caught by thunk rejection | Not implemented |
| **Stale data** | Files uploaded in another session | No real-time sync | Would need polling or WebSocket | Not implemented |

## Page-Level States

| State | Condition | What User Sees | Implementation | Status |
|-------|-----------|----------------|----------------|--------|
| **Initial load** | Page mounted, fetching uploaded files | Upload zone + skeleton table | Dispatch `fetchUploadedFiles` on mount | Done |
| **Ready** | Uploaded files fetched | Full page with zone, list, table | `fetchStatus === 'succeeded'` | Done |
| **Upload + fetch** | Uploading files while table loads | Both progress bars and skeletons visible | Independent state slices | Done |

## Gap Summary

| Gap | Area Affected | Priority | Notes |
|-----|--------------|----------|-------|
| Offline/network error detection | All API calls | Medium | Need navigator.onLine or fetch error type detection |
| Upload cancellation | Per-file card | Medium | Would need AbortController integration |
| Real-time sync | Uploaded files table | Low | Would need WebSocket or polling |
| Drag-and-drop keyboard alternative | Upload zone | Medium | Need keyboard-accessible file selection (click works, but no keyboard drag) |
| Rate limiting | Upload API | Low | Requires API-side implementation |

## AI Agent Observations

When generating this file upload feature, AI agents consistently:
1. Implemented the happy-path upload flow correctly (add files, upload, show complete)
2. Missed drag-over visual feedback entirely or used incorrect event handling (no dragenter counter)
3. Did not validate file size or type before adding to queue (waited for server rejection)
4. Implemented "retry all" instead of individual file retry buttons
5. Used jumpy progress bars (0% to 100% on completion) instead of smooth incremental updates
6. Forgot to call `URL.revokeObjectURL` on preview URLs, causing memory leaks
7. Did not enforce the maximum file count, allowing unlimited file additions
8. Generated the remove button even during active upload, allowing inconsistent state
