# File Upload -- Post-Implementation Review

This document captures lessons from building the file upload feature with an AI agent, including common mistakes and how they were corrected.

## What the AI Got Right

**Upload zone structure.** The agent correctly implemented a drag-and-drop zone with a hidden file input as fallback. The click-to-browse interaction worked on the first pass.

**Redux slice structure.** The async thunk pattern (pending/fulfilled/rejected) was implemented correctly for upload, fetch, and delete operations. The state shape matched the spec with per-file status tracking.

**File preview cards.** The layout with thumbnail, file info, progress bar, and action buttons was well-structured. Status badges differentiated between queued, uploading, complete, and failed states.

**API integration.** The NestJS controller/service pattern matched existing module conventions. Mock data with randomized delays and failure rates worked correctly for exercising error paths.

## Common Mistakes Caught

### 1. No Drag-Over Visual Feedback

**Issue:** The agent implemented drag-and-drop file handling but did not change the visual appearance of the upload zone when a file was dragged over it. The zone looked identical during drag-over, giving no feedback that it was a valid drop target.

**Fix:** Added `isDragOver` state toggled by `dragenter`/`dragleave` events. Applied conditional classes to change border color to primary and add a tinted background (`bg-primary/5`). Used a `dragCounter` ref to prevent flicker from nested elements.

**Lesson:** Drag-over visual feedback requires a counter-based approach for `dragenter`/`dragleave` to handle nested DOM elements. Without this, the drag-over state flickers as the cursor moves over child elements. The spec must explicitly require visual feedback during drag-over.

### 2. No File Size/Type Validation Before Upload

**Issue:** The agent added files directly to the queue without checking file type or size. Validation only happened server-side, which wasted time uploading invalid files and showed confusing server errors instead of clear client-side messages.

**Fix:** Added client-side validation in the `validateAndAddFiles` function. Files that fail type or size checks are rejected with a descriptive toast error before being added to the queue. Only valid files are dispatched to `addFiles`.

**Lesson:** Client-side validation must happen before files enter the queue. AI agents default to trusting all input and relying on server-side validation. The spec must explicitly state that validation happens at the point of file selection, not at upload time.

### 3. No Individual File Retry (Only "Retry All")

**Issue:** The agent implemented a single "Retry All" button at the list level that re-uploaded every failed file. There was no way to retry a single failed upload without retrying all of them.

**Fix:** Added a retry button on each `FilePreviewCard` that dispatches `uploadFile` for just that file's ID. The "Retry All" button was not needed since individual retry covers all use cases.

**Lesson:** Per-file retry is more useful than batch retry. Users want to retry specific files, especially when some failures are due to transient errors and others may require the user to replace the file. AI agents default to batch operations.

### 4. Progress Bar Not Smooth (Jumps from 0 to 100)

**Issue:** The agent only updated progress on upload completion, causing the progress bar to jump from 0% directly to 100%. There was no intermediate progress indication, making the upload feel instantaneous or broken.

**Fix:** Implemented a `setInterval`-based progress simulation that increments progress by random amounts (5-15%) every 200ms, capping at 90% until the actual upload completes. The `updateFileProgress` action updates the Redux state, and the progress bar uses CSS `transition-all duration-300 ease-out` for smooth visual updates.

**Lesson:** Upload progress must be simulated when using a JSON metadata approach (no actual binary upload). AI agents skip progress simulation entirely. The spec must explicitly describe how progress should be simulated and that the bar must animate smoothly via CSS transitions.

### 5. Preview URLs Not Cleaned Up (Memory Leak)

**Issue:** The agent created `URL.createObjectURL()` for image previews but never called `URL.revokeObjectURL()` when files were removed or the component unmounted. This leaked blob URLs in memory, which accumulate over time.

**Fix:** Stored the preview URL in a ref and added a `useEffect` cleanup function that calls `URL.revokeObjectURL()` on unmount. The `removeFile` action in the upload zone also handles revocation when files are manually removed.

**Lesson:** Every `URL.createObjectURL()` call must have a corresponding `URL.revokeObjectURL()` call. This is a common memory leak that AI agents miss because the preview still works without cleanup. The spec must explicitly require URL cleanup on both unmount and removal.

### 6. No Max File Count Enforcement

**Issue:** The agent allowed unlimited files to be added to the queue. Dropping 20 files at once would create 20 file cards, overwhelming the UI and potentially causing performance issues.

**Fix:** Added a count check that calculates remaining slots (`MAX_FILE_COUNT - activeFileCount`) before processing dropped or selected files. When the limit is exceeded, a toast error explains the constraint and only the first N files (up to the remaining slots) are added.

**Lesson:** File count limits must be enforced at the point of selection, not just documented. AI agents implement size and type validation more reliably than count validation. The upload zone should also visually indicate when it is at capacity (disabled state with muted appearance).

## Acceptance Criteria Results

| AC    | Description                                     | Status |
| ----- | ----------------------------------------------- | ------ |
| AC-1  | Upload zone renders with dashed border          | Pass |
| AC-2  | Drag-over changes visual appearance             | Pass (after fix #1) |
| AC-3  | Dropping valid files adds to queue              | Pass |
| AC-4  | Clicking zone opens file picker                 | Pass |
| AC-5  | Files exceeding 10 MB rejected with toast       | Pass (after fix #2) |
| AC-6  | Unsupported file types rejected with toast      | Pass (after fix #2) |
| AC-7  | More than 5 files shows toast error             | Pass (after fix #6) |
| AC-8  | Image files show thumbnail preview              | Pass |
| AC-9  | File cards show name, size, type badge          | Pass |
| AC-10 | "Upload All" dispatches upload for queued files | Pass |
| AC-11 | Progress bar animates smoothly                  | Pass (after fix #4) |
| AC-12 | Successful uploads show green checkmark         | Pass |
| AC-13 | Failed uploads show red X and retry button      | Pass (after fix #3) |
| AC-14 | Retry re-uploads only the failed file           | Pass (after fix #3) |
| AC-15 | Remove button works at any state                | Pass |
| AC-16 | "Clear Completed" removes completed files       | Pass |
| AC-17 | Previously uploaded files in table              | Pass |
| AC-18 | Delete button removes from server and table     | Pass |
| AC-19 | Skeleton loading state while fetching           | Pass |
| AC-20 | Preview URLs cleaned up on unmount              | Pass (after fix #5) |

## Key Takeaways

1. **Drag-over feedback requires a counter.** Simple `dragenter`/`dragleave` handling flickers on nested elements. Always use a counter ref that increments on enter and decrements on leave, only setting the drag-over state when the counter transitions between 0 and 1.
2. **Client-side validation must precede queuing.** File type, size, and count checks must happen before files enter the Redux store. Server-side validation is a fallback, not the primary gate.
3. **Individual retry is essential.** Per-file retry buttons are more useful than batch retry. Users need granular control over which failed uploads to retry.
4. **Progress must be simulated smoothly.** When not using actual binary upload progress events, simulate incremental progress with intervals. CSS transitions on the progress bar width provide visual smoothness.
5. **Blob URLs must be revoked.** Every `URL.createObjectURL` needs a matching `URL.revokeObjectURL` on component unmount and file removal. This is a silent memory leak that does not cause visible bugs.
6. **Count limits need enforcement and UI feedback.** Max file count must be enforced at selection time. The upload zone should visually disable when at capacity.
