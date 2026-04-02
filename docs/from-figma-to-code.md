# From Figma to Code

This guide covers the workflow for turning a Figma design into production code using agent-ready-shadcn-starter. It covers extracting design specs, mapping tokens to Tailwind and shadcn/ui, structuring prompts with visual context, and reviewing for visual fidelity.

## The workflow

```
1. Extract specs     ->  Pull measurements, tokens, and component inventory from Figma
2. Map to stack      ->  Translate design tokens to Tailwind classes and shadcn/ui components
3. Build the prompt  ->  Structure the AI prompt with visual context and constraints
4. Generate code     ->  Run the prompt and collect output
5. Review visually   ->  Compare the implementation to the design side-by-side
6. Fix and refine    ->  Correct discrepancies, update prompts
```

## Step 1: Extract specs from Figma

Before prompting an AI agent, extract concrete specs from the Figma design. Vague descriptions like "make it look like the mockup" produce poor results. Specific measurements produce accurate code.

### What to extract

For every screen or component in the design, document:

**Layout and spacing:**
- Container widths (max-width, padding)
- Spacing between elements (gap, margin, padding) in pixels
- Grid columns and breakpoints if the design is responsive

**Typography:**
- Font family, weight, and size for each text style
- Line height and letter spacing
- Text color values

**Colors:**
- Background colors
- Border colors
- Text colors for each context (heading, body, muted, error)
- Hover and active state colors

**Components:**
- Which elements map to shadcn/ui components (buttons, inputs, cards, tables, dialogs)
- Variants in use (button sizes, card styles)
- Icon names if the design uses an icon library

**States:**
- Default, hover, focus, active, disabled states
- Loading, error, empty, success states
- Responsive behavior at mobile, tablet, and desktop breakpoints

### How to extract from Figma

1. **Use Figma's Inspect panel.** Select an element and view its CSS properties. Note padding, margin, font, and color values.
2. **Use the Dev Mode** (if available). Dev Mode shows specs in a developer-friendly format with spacing overlays.
3. **Measure spacing with the ruler.** Hold Alt/Option and hover between elements to see distances.
4. **Export assets** (icons, illustrations) as SVG where possible.
5. **Screenshot the design** at desktop and mobile breakpoints for reference.

### Organizing the extracted specs

Create a structured spec document. Here is a template:

```markdown
## Screen: Login Page

### Layout
- Container: max-width 400px, centered horizontally
- Card padding: 24px (p-6)
- Spacing between form fields: 16px (space-y-4)
- Spacing between card sections: 24px (space-y-6)

### Typography
- Page title: text-2xl font-semibold tracking-tight
- Field labels: text-sm font-medium
- Helper text: text-sm text-muted-foreground
- Error text: text-sm text-destructive

### Colors
- Card background: card (shadcn token)
- Primary button: primary (shadcn token)
- Input border: border (shadcn token)
- Focus ring: ring (shadcn token)

### Components
- Card with CardHeader, CardContent, CardFooter
- Input fields with Label
- Button (default variant, full width)
- Separator between social login and email form

### States
- Loading: Button shows spinner, inputs disabled
- Error: Red border on invalid fields, error text below field
- Mobile: Card fills viewport width with 16px margin
```

## Step 2: Map design tokens to Tailwind and shadcn/ui

### Spacing

Figma designs use pixel values. Map them to Tailwind spacing scale:

| Pixels | Tailwind class | Common use |
|--------|---------------|------------|
| 4px | `p-1`, `gap-1` | Tight spacing, icon padding |
| 8px | `p-2`, `gap-2` | Compact elements |
| 12px | `p-3`, `gap-3` | Input padding |
| 16px | `p-4`, `gap-4` | Standard section spacing |
| 20px | `p-5`, `gap-5` | Card body padding |
| 24px | `p-6`, `gap-6` | Card padding, section gaps |
| 32px | `p-8`, `gap-8` | Page section spacing |
| 48px | `p-12`, `gap-12` | Large section spacing |

If a Figma value does not land exactly on the scale, round to the nearest value. A 14px gap becomes `gap-3.5` or rounds to `gap-4`. Consistency matters more than pixel-perfect matching.

### Typography

Map Figma font styles to Tailwind typography classes:

| Figma style | Tailwind classes |
|------------|-----------------|
| Heading 1 (30px bold) | `text-3xl font-bold tracking-tight` |
| Heading 2 (24px semibold) | `text-2xl font-semibold tracking-tight` |
| Heading 3 (20px semibold) | `text-xl font-semibold` |
| Body (16px regular) | `text-base` |
| Body small (14px regular) | `text-sm` |
| Caption (12px medium) | `text-xs font-medium` |

### Colors

shadcn/ui uses semantic color tokens. Map Figma colors to these tokens rather than hardcoding hex values:

| Design intent | shadcn token | Tailwind class |
|--------------|-------------|---------------|
| Page background | `background` | `bg-background` |
| Card surface | `card` | `bg-card` |
| Primary action | `primary` | `bg-primary text-primary-foreground` |
| Secondary action | `secondary` | `bg-secondary text-secondary-foreground` |
| Destructive action | `destructive` | `bg-destructive text-destructive-foreground` |
| Muted text | `muted-foreground` | `text-muted-foreground` |
| Borders | `border` | `border-border` |
| Focus ring | `ring` | `ring-ring` |

If the Figma design uses custom colors not in the shadcn palette, extend the theme in `packages/ui/src/styles/globals.css` under the `:root` and `.dark` selectors.

### Component mapping

Map Figma design elements to shadcn/ui components:

| Design element | shadcn component | Import |
|---------------|-----------------|--------|
| Text input field | `Input` + `Label` | `@workspace/ui/components/input` |
| Dropdown | `Select` | `@workspace/ui/components/select` |
| Toggle/switch | `Checkbox` | `@workspace/ui/components/checkbox` |
| Modal/popup | `Dialog` | `@workspace/ui/components/dialog` |
| Data grid | `Table` | `@workspace/ui/components/table` |
| Notification | `Sonner` (toast) | `@workspace/ui/components/sonner` |
| Status pill | `Badge` | `@workspace/ui/components/badge` |
| Content section | `Card` | `@workspace/ui/components/card` |
| Section divider | `Separator` | `@workspace/ui/components/separator` |
| Tab navigation | `Tabs` | `@workspace/ui/components/tabs` |
| Context menu | `DropdownMenu` | `@workspace/ui/components/dropdown-menu` |
| Placeholder rows | `Skeleton` | `@workspace/ui/components/skeleton` |

If a design element does not map to an existing shadcn component, check the shadcn/ui registry before building a custom one. Many components are available but not yet added to this repo.

## Step 3: Build the prompt with visual context

A well-structured prompt turns a Figma design into accurate code on the first pass. Here is the structure:

### Prompt template

```markdown
## Context

[Paste your project conventions block -- see how-to-use-with-claude.md or
how-to-use-with-codex.md for the standard context block]

## Reference implementation

[Paste a similar existing component from the repo, e.g., login-form.tsx]

## Design spec

[Paste the extracted spec from Step 1]

## Screenshot description

The design shows:
- [Describe the layout in plain language]
- [Describe the visual hierarchy]
- [Call out any non-obvious details]

## Requirements

1. Create the component at [exact file path]
2. Use only shadcn/ui components from @workspace/ui
3. Use Tailwind classes for all styling -- no inline styles
4. Match the spacing and typography specs above exactly
5. Handle these states: [loading, error, empty, success]
6. Make it responsive: [describe mobile behavior]

## Constraints

- Do not install new dependencies
- Do not create custom components if a shadcn/ui equivalent exists
- Use React Hook Form + Zod for any form validation
- All text content should be directly in the component (no i18n for now)

## Verification

After generating the code:
1. Does the layout match the spacing spec?
2. Are the correct shadcn/ui components used?
3. Is the typography consistent with the design?
4. Do all interactive elements have hover/focus states?
5. Does the responsive behavior match the spec?
```

### Tips for describing designs to AI agents

AI agents cannot see Figma files directly. Your prompt needs to convey the design through structured text:

- **Describe layout as a hierarchy.** "The page has a centered card (max-w-md). Inside the card: a header with title and subtitle, then a form with three fields stacked vertically (space-y-4), then a footer with two buttons side by side (flex gap-3)."
- **Reference Tailwind classes in the description.** This removes ambiguity about spacing and sizing.
- **Call out what is NOT default.** If a button is full-width instead of auto-width, say so. If a card has no border, say so.
- **Describe responsive changes explicitly.** "On mobile (below md breakpoint), the two-column layout becomes single column. The sidebar moves below the main content."

## Step 4: Generate and collect code

Run the prompt using your preferred AI agent (see the Claude and Codex guides). For complex screens, break the work into multiple prompts:

1. **Layout and structure first.** Get the page skeleton and container hierarchy right.
2. **Components second.** Fill in the individual components within the layout.
3. **State and interactions third.** Add loading states, form validation, error handling.
4. **Responsive adjustments last.** Verify and fix mobile/tablet behavior.

## Step 5: Review for visual fidelity

After the code is generated and running in the browser, compare it to the Figma design.

### Side-by-side comparison

Open the running app and the Figma design side by side. Check these areas:

**Spacing and alignment:**
- Is the overall container width correct?
- Are gaps between elements consistent with the spec?
- Is vertical spacing between sections correct?
- Are elements aligned to the same grid?

**Typography:**
- Are font sizes correct for headings, body, and captions?
- Are font weights correct (bold vs. semibold vs. regular)?
- Is line height appropriate (text not too cramped or too loose)?

**Colors and surfaces:**
- Do card backgrounds match the design?
- Are border colors correct?
- Do interactive elements use the right color tokens?
- Does the dark mode version look correct?

**Component behavior:**
- Do buttons have the right variant (default, secondary, outline, ghost)?
- Do inputs show focus rings on keyboard focus?
- Do dropdowns and dialogs animate correctly?
- Are loading skeletons the right shape and position?

**Responsive behavior:**
- Does the layout reflow correctly at mobile widths?
- Are touch targets at least 44x44px on mobile?
- Does text remain readable at small screen sizes?
- Are horizontal scrollbars absent?

## Common pitfalls

These are the issues that most frequently occur when translating Figma designs to code with AI agents.

### Spacing inconsistencies

**Problem:** The AI uses different spacing values throughout the component, or ignores the spacing spec entirely.

**Fix:** Provide spacing as explicit Tailwind classes in the prompt. Instead of "add some padding," write "use `p-6` for card padding and `space-y-4` for form field gaps."

### Responsive behavior missing

**Problem:** The AI builds a desktop-only layout with no responsive adjustments.

**Fix:** Specify breakpoints in the prompt. "The two-column grid (`grid-cols-2`) should become single column (`grid-cols-1`) below the `md` breakpoint. Use `md:grid-cols-2`."

### Wrong component mapping

**Problem:** The AI builds a custom dropdown instead of using the shadcn `Select` component, or creates a custom modal instead of `Dialog`.

**Fix:** Include the component mapping table in your prompt. List which shadcn/ui components to use for each design element.

### Hardcoded colors

**Problem:** The AI uses hardcoded hex values like `bg-[#1a1a2e]` instead of semantic tokens like `bg-card`.

**Fix:** State explicitly in the prompt: "Use shadcn/ui semantic color tokens (bg-background, text-foreground, bg-card, etc.). Do not use arbitrary color values."

### Missing dark mode

**Problem:** The component looks correct in light mode but breaks in dark mode because of hardcoded colors.

**Fix:** Using semantic tokens (`bg-background`, `text-foreground`) automatically supports dark mode. If the AI uses hardcoded values, ask it to replace them with semantic tokens.

### Focus states missing

**Problem:** Buttons and links have hover states but no visible focus indicator for keyboard users.

**Fix:** shadcn/ui components include focus states by default. If the AI builds custom interactive elements, require `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.

### Icon mismatches

**Problem:** The Figma design uses specific icons but the AI substitutes different ones or invents icon components.

**Fix:** Specify the icon library (Lucide is the default for shadcn/ui) and the exact icon names: "Use the `Mail` icon from `lucide-react` for the email field, and `Lock` for the password field."

## Visual fidelity checklist

Use this checklist when reviewing AI-generated code against a Figma design.

### Layout

- [ ] Container max-width matches the design
- [ ] Page-level padding is correct
- [ ] Grid columns and gaps match the design
- [ ] Element alignment (left, center, right) is correct
- [ ] Vertical spacing between sections matches the spec

### Typography

- [ ] Heading sizes and weights match the design
- [ ] Body text size and line height are correct
- [ ] Muted/secondary text uses the right color token
- [ ] Text truncation or wrapping behaves correctly for long content

### Colors and theme

- [ ] Backgrounds use semantic tokens, not hardcoded values
- [ ] Text colors use semantic tokens
- [ ] Border colors are consistent with the design
- [ ] Light mode looks correct
- [ ] Dark mode looks correct

### Components

- [ ] Correct shadcn/ui components are used (not custom replacements)
- [ ] Button variants match the design (default, secondary, outline, ghost, destructive)
- [ ] Input fields have proper labels and placeholders
- [ ] Select/dropdown components match the design
- [ ] Cards have the right border, shadow, and padding

### States

- [ ] Hover states are present on interactive elements
- [ ] Focus states are visible for keyboard navigation
- [ ] Loading states use Skeleton or spinner as appropriate
- [ ] Error states show destructive color and message text
- [ ] Empty states show a helpful message and optional action
- [ ] Disabled states dim the element and prevent interaction

### Responsive

- [ ] Layout reflows correctly at mobile breakpoint
- [ ] Layout reflows correctly at tablet breakpoint
- [ ] Touch targets are at least 44x44px on mobile
- [ ] No horizontal overflow at any breakpoint
- [ ] Text remains readable at small screen sizes
- [ ] Navigation adapts appropriately (hamburger menu, collapsed sidebar, etc.)

### Accessibility

- [ ] All images have alt text
- [ ] Form inputs have associated labels
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for text, 3:1 for large text)
- [ ] Interactive elements are keyboard accessible
- [ ] Focus order follows visual order
