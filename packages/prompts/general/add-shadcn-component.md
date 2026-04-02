# Add shadcn/ui Component

> Difficulty: Low

## Context

This prompt guides the process of adding a new shadcn/ui component to the monorepo and customizing it for the project's needs. In this monorepo, shadcn/ui components live in the shared `packages/ui/` package and are imported by `apps/web/` via the `@workspace/ui` alias.

- **UI package:** `packages/ui/src/components/`
- **Import pattern:** `import { ComponentName } from "@workspace/ui/components/component-name"`
- **Styling:** Tailwind CSS v4, using CSS variables for theming
- **Icon library:** `lucide-react`

## Input

1. The name of the shadcn/ui component to add (e.g., "dialog", "select", "tabs").
2. Any customization requirements -- additional variants, modified defaults, or wrapper components needed.
3. Check what components already exist: `ls packages/ui/src/components/`

## Instructions

### Step 1: Install the Component

Run the shadcn CLI from the monorepo root, targeting the web app (which resolves to the UI package via the `components.json` configuration):

```bash
pnpm dlx shadcn@latest add {component-name} -c apps/web
```

This places the component in `packages/ui/src/components/{component-name}.tsx`.

### Step 2: Verify the Installation

1. Open `packages/ui/src/components/{component-name}.tsx` and confirm it was created.
2. Check that it exports the expected sub-components (e.g., `Dialog`, `DialogTrigger`, `DialogContent`, etc.).
3. Verify the component's dependencies are installed in `packages/ui/package.json`.

### Step 3: Customize if Needed

If the default component needs modification:

1. **Additional variants:** Add new variants to the component's `cva` (class-variance-authority) definition. Follow the existing pattern of variant names and values.
2. **Default prop changes:** Modify default props in the component definition, not at every call site.
3. **Wrapper components:** If you need a specialized version (e.g., a `ConfirmDialog` wrapping `AlertDialog`), create it in the consuming feature directory (`apps/web/features/{feature}/components/`), not in the shared UI package.

### Step 4: Use in Your Feature

Import the component in your feature code:

```tsx
import { ComponentName } from "@workspace/ui/components/component-name";
```

Follow these conventions:
- Use the component as documented in the shadcn/ui docs.
- Compose smaller shadcn primitives rather than building custom components from scratch.
- Apply custom styling via Tailwind classes in the `className` prop, not by modifying the shared component.

### Step 5: Verify

1. **Type check:** `pnpm typecheck` passes.
2. **Visual:** Render the component in your page and confirm it looks correct.
3. **Accessibility:** Check keyboard interaction, focus trapping (for modals/dialogs), and ARIA attributes.
4. **Dark mode:** If the app uses `next-themes`, confirm the component works in both light and dark modes.

## Output

| File | Action | Description |
| ---- | ------ | ----------- |
| `packages/ui/src/components/{component-name}.tsx` | Created by CLI | The shadcn/ui component |
| `packages/ui/package.json` | Modified by CLI | Dependencies added if needed |

## Verification

1. `pnpm typecheck` -- Zero errors across the monorepo.
2. Import and render the component in a page. Confirm it renders without runtime errors.
3. Test interactive behavior (open/close, focus management, keyboard shortcuts).
4. Verify the component respects the project's theme (CSS variables, dark mode).
