# File Upload Example

> Status: Coming Soon

## What This Will Cover

A file upload interface with drag-and-drop, progress tracking, validation, and preview. This example demonstrates how to handle file uploads in a way that provides a polished user experience with proper error handling.

**Planned features:**
- Drag-and-drop zone with visual feedback (hover state, accepted/rejected indicators)
- Click-to-browse fallback for accessibility
- File type and size validation with clear error messages
- Upload progress bar per file
- Image preview for image uploads, file icon for other types
- Multiple file upload with individual cancel capability
- Server-side upload endpoint with chunked transfer for large files

**Key patterns to demonstrate:**
- Drag-and-drop event handling with proper `dragenter`/`dragleave` counting
- Client-side file validation before upload (type, size, dimensions for images)
- `XMLHttpRequest` or `fetch` with progress events for upload tracking
- Abort controller for canceling in-flight uploads
- Thumbnail generation for image previews using `FileReader` and `canvas`
- Accessible drag-and-drop (keyboard alternative, screen reader announcements)

## Related Files

- Spec: `packages/specs/file-upload.md` (to be written)
- Prompt: `packages/prompts/build-file-upload.md` (to be written)
