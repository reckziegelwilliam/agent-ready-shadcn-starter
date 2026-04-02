# Multi-Step Wizard Example

> Status: Coming Soon

## What This Will Cover

A multi-step form wizard with progress tracking, step validation, and data persistence across steps. This example demonstrates how to manage complex form flows that span multiple screens.

**Planned steps:**
- Step 1: Basic information (text inputs)
- Step 2: Preferences (checkboxes, selects)
- Step 3: File upload (drag-and-drop zone)
- Step 4: Review and confirm (read-only summary)

**Key patterns to demonstrate:**
- Step-by-step navigation with progress indicator
- Per-step validation that blocks advancement until the step is valid
- Data persistence in Redux so users can navigate back without losing input
- A final review step that displays all collected data before submission
- Handling the full submission as a single API call
- Back/Next navigation with keyboard shortcuts

## Related Files

- Spec: `packages/specs/multi-step-wizard.md` (to be written)
- Prompt: `packages/prompts/build-multi-step-wizard.md` (to be written)
