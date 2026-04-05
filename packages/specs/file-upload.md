# File Upload with Drag & Drop

> Spec version: 1.0

## Overview

A file upload form with drag-and-drop support, file preview thumbnails, per-file upload progress, and failure handling with individual retry. Files are validated client-side before upload. The upload API simulates network latency and random failures to exercise error paths.

## User Stories

- **As a** user, **I want to** drag files onto an upload zone, **so that** I can upload files quickly without navigating a file picker.
- **As a** user, **I want to** click the upload zone to browse files, **so that** I have an alternative to drag-and-drop.
- **As a** user, **I want to** see a thumbnail preview for image files, **so that** I can confirm I selected the correct image.
- **As a** user, **I want to** see upload progress per file, **so that** I know how long each upload will take.
- **As a** user, **I want to** retry a failed upload individually, **so that** I do not need to re-upload all files.
- **As a** user, **I want to** remove a file from the queue before or after upload, **so that** I can correct mistakes.

## Screens / Components

### Screen: File Upload

**Route:** `/upload`

**Description:** A page with a title, description, drag-and-drop upload zone, current upload list with progress, and a table of previously uploaded files.

**Components:**
- `UploadZone` -- Drag-and-drop area with dashed border. Changes appearance on drag-over. Click triggers hidden file input. Validates file type and size before adding to the queue.
- `FilePreviewCard` -- Shows file thumbnail (for images), file name, formatted size, type badge, progress bar during upload, status icon (checkmark or X), remove button, retry button for failed uploads.
- `UploadList` -- Renders a list of FilePreviewCards. Shows "Upload All" button when queued files exist. "Clear Completed" button when any uploads are complete.
- `UploadedFilesTable` -- Table of previously uploaded files fetched from the API. Columns: name, size, date, delete button.
- `UploadPageLoading` -- Skeleton placeholder for initial page load.

## File Constraints

| Constraint | Value |
|-----------|-------|
| Accepted image types | image/jpeg, image/png, image/gif, image/webp |
| Accepted document types | application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| Max file size | 10 MB (10,485,760 bytes) |
| Max files per batch | 5 |

## States

### Upload Zone

| State | Condition | What the User Sees |
|-------|-----------|-------------------|
| Idle | No interaction | Dashed border, cloud upload icon, "Drag & drop files here or click to browse" text |
| Drag-over | File dragged over zone | Border color changes to primary, background becomes primary/5, icon animates |
| Files selected | Files added to queue | Zone returns to idle, files appear in upload list below |

### Per-File States

| State | Condition | What the User Sees |
|-------|-----------|-------------------|
| Queued | File added, not yet uploading | File card with name/size, "Queued" badge, remove button |
| Uploading | Upload in progress | Progress bar animating, percentage text, no remove button |
| Complete | Upload succeeded | Green checkmark icon, "Complete" badge, remove button |
| Failed | Upload returned error | Red X icon, "Failed" badge, error message, retry button, remove button |

### Validation States

| State | Condition | What the User Sees |
|-------|-----------|-------------------|
| File too large | File exceeds 10 MB | Toast error: "File {name} exceeds the 10 MB limit." File not added. |
| Wrong file type | File type not in accepted list | Toast error: "File {name} has an unsupported file type." File not added. |
| Max files exceeded | Adding files would exceed 5 total queued/uploading | Toast error: "You can upload up to 5 files at once." Excess files not added. |

### Page States

| State | Condition | What the User Sees |
|-------|-----------|-------------------|
| Loading | Fetching uploaded files list | Skeleton table placeholder |
| Loaded | Files list fetched | Table with previously uploaded files, or empty state message |
| Error (fetch) | GET /uploads failed | Error message with retry button |

## Data Models

```typescript
interface FileUpload {
  id: string;
  file: {
    name: string;
    size: number;
    type: string;
  };
  status: 'queued' | 'uploading' | 'complete' | 'failed';
  progress: number;
  error?: string;
  previewUrl?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface UploadsState {
  files: FileUpload[];
  uploadedFiles: UploadedFile[];
  fetchStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  fetchError: string | null;
}
```

## API Contracts

### `POST /uploads`

**Description:** Simulate file upload. Accepts file metadata as JSON (not actual file data). Returns success after 1-3s delay. 15% random failure rate.

**Request:**
```typescript
interface UploadRequest {
  name: string;
  size: number;
  type: string;
}
```

**Response (201):**
```typescript
interface UploadResponse {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}
```

**Error Response (500):**
```typescript
{ message: "Upload failed. Please try again." }
```

### `GET /uploads`

**Description:** Returns list of previously uploaded files.

**Response (200):**
```typescript
UploadResponse[]
```

### `DELETE /uploads/:id`

**Description:** Removes an uploaded file.

**Response (200):**
```typescript
{ message: "File deleted." }
```

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| File type | Must be in accepted types list | "{name} has an unsupported file type." |
| File size | Must be <= 10 MB | "{name} exceeds the 10 MB limit." |
| File count | Queue + uploading must be <= 5 | "You can upload up to 5 files at once." |

## Acceptance Criteria

- [ ] **AC-1:** Upload zone renders with dashed border and instruction text.
- [ ] **AC-2:** Dragging a file over the zone changes the visual appearance (border color, background).
- [ ] **AC-3:** Dropping valid files adds them to the upload queue.
- [ ] **AC-4:** Clicking the zone opens a file picker dialog.
- [ ] **AC-5:** Files exceeding 10 MB are rejected with a toast error.
- [ ] **AC-6:** Files with unsupported types are rejected with a toast error.
- [ ] **AC-7:** Adding more than 5 files shows a toast error.
- [ ] **AC-8:** Image files show a thumbnail preview using URL.createObjectURL.
- [ ] **AC-9:** Each file card shows name, formatted size, and type badge.
- [ ] **AC-10:** "Upload All" button dispatches upload for all queued files.
- [ ] **AC-11:** Upload progress bar animates smoothly from 0 to 100%.
- [ ] **AC-12:** Successful uploads show a green checkmark and "Complete" badge.
- [ ] **AC-13:** Failed uploads show a red X, error message, and retry button.
- [ ] **AC-14:** Retry button re-uploads only the failed file.
- [ ] **AC-15:** Remove button removes a file from the queue at any state.
- [ ] **AC-16:** "Clear Completed" removes all completed uploads from the list.
- [ ] **AC-17:** Previously uploaded files appear in a table below the upload list.
- [ ] **AC-18:** Delete button on uploaded files removes them from the server and table.
- [ ] **AC-19:** Page shows skeleton loading state while fetching uploaded files.
- [ ] **AC-20:** Preview URLs are cleaned up with URL.revokeObjectURL on unmount.

## Out of Scope

- Actual file binary upload (simulation only)
- Chunked upload / resumable upload
- Image cropping or editing
- Folder upload
- Upload cancellation mid-flight

## Open Questions

- [ ] Should drag-and-drop count `dragenter`/`dragleave` events to handle nested elements?
- [ ] Should completed files auto-clear after a timeout?
