# Settings Page Example

> Status: Coming Soon

## What This Will Cover

A multi-section settings page with tabbed navigation, form persistence, and optimistic updates. This example demonstrates how to handle complex form state across multiple sections that save independently.

**Planned sections:**
- Profile settings (name, email, avatar upload)
- Notification preferences (email, push, frequency)
- Appearance settings (theme, density, language)
- Security settings (password change, two-factor authentication)

**Key patterns to demonstrate:**
- Tabbed layout with shadcn `Tabs` component
- Independent form sections that save without affecting other sections
- Dirty state tracking with unsaved-changes warnings on navigation
- Optimistic UI updates that revert on failure
- File upload for avatar with preview

## Related Files

- Spec: `packages/specs/settings-page.md` (to be written)
- Prompt: `packages/prompts/build-settings-page.md` (to be written)
