# [Feature Name]

> Spec version: 1.0
> Last updated: YYYY-MM-DD

## Overview

_One to three sentences describing what this feature is and why it exists. Include the business or user problem it solves._

## User Stories

- **As a** [role], **I want to** [action], **so that** [outcome].
- **As a** [role], **I want to** [action], **so that** [outcome].

## Screens / Components

### Screen: [Screen Name]

**Route:** `/path/to/screen`

**Description:** _What the user sees and can do on this screen._

**Components:**
- `ComponentName` -- Brief description of what it renders and its responsibilities.
- `ComponentName` -- Brief description.

### Screen: [Another Screen]

_Repeat the pattern above for each screen or major view._

## States

Define every state each screen can be in. AI agents frequently miss edge-case states, so be thorough.

### [Screen Name]

| State    | Condition                        | What the User Sees                          |
| -------- | -------------------------------- | ------------------------------------------- |
| Idle     | Initial load, no interaction yet | Form with empty fields, submit button ready |
| Loading  | Async operation in progress      | Disabled inputs, spinner on submit button   |
| Error    | Server returned an error         | Inline error banner with message            |
| Success  | Operation completed              | Success toast / redirect to next screen     |
| Empty    | No data available                | Empty state illustration with CTA           |

_Repeat for each screen._

## Data Models

Define TypeScript interfaces for every entity involved.

```typescript
interface EntityName {
  id: string;
  // ... fields with types
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

## API Contracts

### `METHOD /api/path`

**Description:** _What this endpoint does._

**Request:**
```typescript
interface RequestBody {
  // fields
}
```

**Response (200):**
```typescript
interface SuccessResponse {
  // fields
}
```

**Error Responses:**

| Status | Code               | Message                    |
| ------ | ------------------ | -------------------------- |
| 400    | `VALIDATION_ERROR` | Field-level error messages |
| 401    | `UNAUTHORIZED`     | Authentication required    |
| 500    | `INTERNAL_ERROR`   | Something went wrong       |

_Repeat for each endpoint._

## Validation Rules

| Field       | Rule                              | Error Message                        |
| ----------- | --------------------------------- | ------------------------------------ |
| `email`     | Required, valid email format      | "Please enter a valid email address" |
| `password`  | Required, min 8 chars             | "Password must be at least 8 characters" |

_List every field that has client-side or server-side validation._

## Acceptance Criteria

Each criterion should be independently testable.

- [ ] **AC-1:** [Specific, verifiable condition]
- [ ] **AC-2:** [Specific, verifiable condition]
- [ ] **AC-3:** [Specific, verifiable condition]

## Out of Scope

_Explicitly list things this spec does NOT cover to prevent scope creep._

- Item that might be assumed but is not included
- Future enhancement that is deferred

## Open Questions

_Unresolved decisions that need input before implementation._

- [ ] Question about design or behavior?
