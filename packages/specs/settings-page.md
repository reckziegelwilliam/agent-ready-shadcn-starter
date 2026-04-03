# Settings Page

> Spec version: 1.0

## Overview

A multi-tab settings page covering Profile, Notifications, and Appearance preferences. Each tab manages its own form state and saves independently. The Profile tab uses explicit save with dirty state tracking. The Notifications tab auto-saves on toggle change with optimistic updates. The Appearance tab applies changes immediately via `next-themes` and a font size preference.

## User Stories

- **As a** user, **I want to** update my display name and bio, **so that** my profile reflects who I am.
- **As a** user, **I want to** control which notifications I receive, **so that** I am not overwhelmed by alerts.
- **As a** user, **I want to** switch between light, dark, and system themes, **so that** the app matches my visual preference.
- **As a** user, **I want to** adjust font size, **so that** the app is comfortable to read.

## Screens / Components

### Screen: Settings

**Route:** `/settings`

**Description:** A page with a title, description, and a tabbed interface with three tabs: Profile, Notifications, and Appearance.

**Components:**
- `SettingsLayout` -- Page container with title ("Settings") and description ("Manage your account settings and preferences.").
- `ProfileForm` -- Form with name and bio fields. Email is displayed read-only. Save button enables only when the form is dirty.
- `NotificationsForm` -- Toggle switches for email notifications, push notifications, and marketing emails. Auto-saves on toggle change with optimistic update.
- `AppearanceForm` -- Theme select (light/dark/system) and font size select (small/default/large). Applies immediately on change.

## States

### Settings Page (Global)

| State | Condition | What the User Sees |
|-------|-----------|-------------------|
| Loading | Initial fetch in flight | Skeleton placeholders for all form fields |
| Loaded | Settings fetched successfully | Populated forms across all tabs |
| Error (fetch) | GET /settings failed | Error message with retry button |

### Profile Tab

| State | Condition | What the User Sees |
|-------|-----------|-------------------|
| Idle | Form loaded, no changes | Populated fields, save button disabled |
| Dirty | User changed name or bio | Save button enabled |
| Saving | PATCH in flight | Save button shows spinner, fields disabled |
| Save success | PATCH returned 200 | Toast: "Profile updated." Form resets dirty state. Save button disables. |
| Save error | PATCH failed | Inline error banner above form. Fields re-enabled. Dirty state preserved. |

### Notifications Tab

| State | Condition | What the User Sees |
|-------|-----------|-------------------|
| Idle | Toggles loaded | Toggles reflect current preferences |
| Saving | PATCH in flight after toggle | Toggle updates optimistically. No visible loading indicator. |
| Save success | PATCH returned 200 | No visible change (toggle already updated optimistically) |
| Save error | PATCH failed | Toggle reverts to previous value. Toast: "Failed to update notification preferences." |

### Appearance Tab

| State | Condition | What the User Sees |
|-------|-----------|-------------------|
| Idle | Selects loaded | Selects reflect current theme and font size |
| Saving | PATCH in flight after change | Change applied immediately. No visible loading. |
| Save success | PATCH returned 200 | No visible change (already applied) |
| Save error | PATCH failed | Revert to previous value. Toast: "Failed to update appearance settings." |

## Data Models

```typescript
interface Settings {
  profile: {
    name: string;
    email: string;
    bio: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'default' | 'large';
  };
}

interface SettingsState {
  settings: Settings | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  saveStatus: 'idle' | 'saving' | 'succeeded' | 'failed';
  error: string | null;
}
```

## API Contracts

### `GET /settings`

**Description:** Fetch the current user's settings.

**Response (200):**
```typescript
interface SettingsResponse {
  profile: {
    name: string;
    email: string;
    bio: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'default' | 'large';
  };
}
```

### `PATCH /settings/profile`

**Description:** Update profile settings.

**Request:**
```typescript
interface UpdateProfileRequest {
  name: string;
  bio: string;
}
```

**Response (200):** Full `SettingsResponse` with updated profile.

**Error Responses:**

| Status | Message |
|--------|---------|
| 422 | "Name is required" |
| 500 | "Something went wrong" |

### `PATCH /settings/notifications`

**Description:** Update notification preferences.

**Request:**
```typescript
interface UpdateNotificationsRequest {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}
```

**Response (200):** Full `SettingsResponse` with updated notifications.

### `PATCH /settings/appearance`

**Description:** Update appearance preferences.

**Request:**
```typescript
interface UpdateAppearanceRequest {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'default' | 'large';
}
```

**Response (200):** Full `SettingsResponse` with updated appearance.

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `name` | Required; min 1 char; max 100 chars | "Name is required" / "Name must be under 100 characters" |
| `bio` | Optional; max 500 chars | "Bio must be under 500 characters" |

## Acceptance Criteria

- [ ] **AC-1:** Settings page loads and shows skeleton while fetching.
- [ ] **AC-2:** Profile tab displays name, email (read-only), and bio fields populated from API.
- [ ] **AC-3:** Profile save button is disabled when form is clean and enabled when dirty.
- [ ] **AC-4:** Profile save shows spinner and disables fields while saving.
- [ ] **AC-5:** Profile save success shows toast and resets dirty state.
- [ ] **AC-6:** Profile save error shows inline error banner and preserves dirty state.
- [ ] **AC-7:** Notification toggles auto-save on change with optimistic update.
- [ ] **AC-8:** Notification save failure reverts toggle and shows error toast.
- [ ] **AC-9:** Theme select applies immediately via next-themes.
- [ ] **AC-10:** Font size select updates immediately.
- [ ] **AC-11:** Appearance save failure reverts to previous value and shows error toast.
- [ ] **AC-12:** All form elements are keyboard accessible with proper labels.
- [ ] **AC-13:** Page is responsive from 320px to 1440px.

## Out of Scope

- Avatar/photo upload
- Password change
- Two-factor authentication
- Account deletion
- Email change flow (email is read-only)

## Open Questions

- [ ] Should unsaved profile changes show a warning when switching tabs?
- [ ] Should notification toggles show a brief saving indicator?
