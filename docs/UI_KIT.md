# Retire Day UI kit

## Source of truth

The production code is the source of truth for the UI kit. Color values live in
`src/ui/tokens/color-*.css`, their descriptions and Figma scopes in
`design-tokens/color-contract.mjs`, the remaining foundations in
`src/ui/tokens/foundations.css`, component styles in `src/ui/ui.css`, and public
React exports in `src/ui/index.ts`.

The Figma library now mirrors the color foundations and their documentation.
Its variables are checked against the generated registry. Production component
code remains the implemented component contract until each Figma component
family is explicitly mirrored and approved. Differences are reconciled
deliberately rather than silently choosing one side. Product content must never
be copied into the kit to make an example look realistic.

The UI kit may change presentation, but it must not change application state or
product behaviour. In particular, a UI migration must not rename or reset
`localStorage` keys, sessions, opened-day progress, analytics identity, vault
data, dates, categories, encryption, PWA caching, or surprise content.

## Layers

The color system has three layers:

1. **Primitive color tokens** are raw palette values and are never consumed by
   product UI.
2. **Alias color tokens** map raw values to intermediate product decisions and
   provide one place to change related semantic roles.
3. **Semantic color tokens** express exact intent and property scope: text,
   icon, frame background, stroke, shape, overlay, or effect.
4. **Components** own their geometry and interaction states. Screens compose
   components; they do not recreate their padding, icon gap, focus ring, or
   disabled treatment.

Use semantic tokens in product UI. Primitives and aliases are hidden internal
collections. Code-authored scenes have a separate internal illustration alias
layer and must not leak those colors into product components.

## Tokens

### Colour

The complete palette, meaning of every color, surface hierarchy, Figma scope
matrix, and all semantic variables are documented in
[`docs/COLOR_SYSTEM.md`](COLOR_SYSTEM.md). The machine-readable Figma mirror is
`design-tokens/generated/color-variables.figma.json`.

The public contract is `--color-semantic-*`. A new semantic variable is not
valid until it has an explicit description and an exact Figma scope. Build
validation rejects direct colors, layer violations, missing descriptions,
invalid scopes, and a stale Figma export.

### Spacing and layout

Spacing uses `--ui-space-0`, `--ui-space-1`, `--ui-space-2`, `--ui-space-3`,
`--ui-space-4`, `--ui-space-5`, `--ui-space-6`, `--ui-space-7`,
`--ui-space-8`, `--ui-space-10`, `--ui-space-12`, and `--ui-space-16`.

- Elements that belong together use the smaller steps.
- Space between groups must be visibly larger than space inside a group.
- Do not add margins to individual labels to imitate grouping. Give the group a
  wrapper and control its `gap`.
- A component owns its internal spacing. A parent owns only the space between
  components.
- App width, content width, gutters, control heights, and safe areas use the
  `--ui-layout-*` tokens.

This proximity rule is especially important for an icon and its label: they
form one content cluster inside the control. Do not position the icon and text
at opposite ends of a full-width button.

### Radius, shadow, and motion

- Radius tokens range from `--ui-radius-xs` through `--ui-radius-sheet`, plus
  `--ui-radius-pill` and `--ui-radius-round`.
- Shadows use `--ui-shadow-sm`, `--ui-shadow-md`, `--ui-shadow-lg`,
  `--ui-shadow-sheet`, and `--ui-shadow-focus`.
- Motion uses `--ui-duration-fast`, `--ui-duration-normal`,
  `--ui-duration-slow`, and semantic easing tokens.
- Layering uses the `--ui-z-*` scale; screens must not invent arbitrary large
  z-index values.

Motion must communicate state or hierarchy. It must respect
`prefers-reduced-motion`; decorative day animations remain outside the kit.

## Typography

The kit uses a local system stack through `--ui-font-sans` and
`--ui-font-display`. It must not depend on a remote font request for first
render.

Use roles instead of selecting arbitrary font sizes:

| Role | Use |
| --- | --- |
| Display | One primary expressive heading on a screen |
| Title | Screen and sheet titles |
| Heading | Card and section headings |
| Body | Reading text and descriptions |
| Label | Buttons, tabs, fields, and compact actions |
| Caption | Supporting explanations, hints, dates, counts, and metadata |

Each role is a combination of the `--ui-font-size-*`,
`--ui-font-weight-*`, `--ui-line-height-*`, and
`--ui-letter-spacing-*` scales. Do not override only the font size while
leaving an unrelated line height. Use no more than one display role per view,
and keep muted colour separate from typographic hierarchy.

## Components

Import public components from `src/ui/index.ts`, never from their internal
files.

### Button

`Button` variants are `primary`, `outline`, `soft`, `action`, `ghost`, and `link`; sizes
are `sm` and `md`. The canonical white application button is
`variant="outline" size="md"`.

- Pass icons through `leadingIcon` or `trailingIcon`. The component owns their
  size, alignment, and gap.
- Use `fullWidth` for layout, not ad-hoc width declarations.
- Use `loading` for an action in progress and native `disabled` for unavailable
  actions.
- `link` is an inline/low-chrome action, not a substitute for navigation
  semantics.
- `action` is the blue-on-soft-blue treatment used for copy actions.
- Never place one interactive element inside another.

### IconButton

Use `IconButton` only when the icon is a familiar action in context. Every icon
button requires a concise `aria-label`; a tooltip is supplementary, not a
replacement for its accessible name.

### TextField

`TextField` owns its label, hint, error, icon positions, focus, and disabled
states. Use `label` whenever the field's purpose is not already permanently
visible. An error replaces supporting guidance and must explain how to recover.
Placeholders are examples, not labels.

### Surface and Divider

`Surface` variants are `plain`, `subtle`, `raised`, and `outlined`. Use one
surface to express one semantic group. Nested surfaces need a real hierarchy;
do not wrap every paragraph in a card.
Choose `as="section"` or `as="article"` when the surface has that document
meaning; the default element is `div`.

`Divider` separates neighbouring sections when spacing alone is insufficient.
It is decorative by default; use semantic structure and headings to describe
the page hierarchy.

### TabsList and Tab

`TabsList` groups related views at the same hierarchy level. Each `Tab` receives
an explicit `selected` state. Tabs are not filters, buttons for unrelated
actions, or a way to reveal unreleased surprise categories.

### Badge

`Badge` is compact metadata. The `neutral` variant is informational; `accent`
highlights a meaningful current status. It must not carry essential information
through colour alone.

### Product patterns

- `CopyAction` owns the copy/copy-complete labels and canonical copy/check
  icons while the product remains responsible for the clipboard operation.
- `SheetFooter` owns the paired previous/close controls used by day sheets.
- `EmptyState` owns the proximity and type hierarchy of empty collections.

## Icons

Use icons exported by `Icons` (or their named exports) from `src/ui/index.ts`.

- Default control icons are 18–20 px and inherit `currentColor`.
- Keep stroke width consistent; do not mix unrelated icon families in one
  surface.
- The component controls icon-to-label spacing. Never insert whitespace or
  absolute positioning to tune it per screen.
- Decorative icons use `aria-hidden`; meaningful standalone icons need a title
  or an accessible label on their control.
- Emoji may remain part of surprise content, but it is not a replacement for a
  system action icon.

## What is not part of the UI kit

The kit does not own:

- day illustrations, animated scenes, flowers, confetti, or the finale artwork;
- photographs, video, certificate artwork, or company logos;
- meme crop and offset rules;
- speech-bubble placement relative to a face;
- coupon, compliment, certificate, and video copy;
- day-specific layout exceptions or encrypted media;
- archive release rules, dates, progress, authentication, and analytics logic.

Those are product content or product behaviour. They may be composed with kit
components, but must not become tokens or generic component props.

## Showcase and verification

`src/ui/UIKitShowcase.tsx` is an internal catalogue with fictional content. It
is available only after authentication as the test role with `?ui-kit=1` (or
through the test toolbar). A live session cannot render it, and normal product
navigation never exposes it.

For every component change, inspect the showcase at the app's representative
viewport widths, keyboard through all controls, and verify normal, hover,
active, focus-visible, disabled, loading, error, and reduced-motion states.
Then run:

```bash
npm run verify:release
git diff --check
```

Screen migrations should be small and reversible: introduce tokens first,
migrate one component family, compare before/after, and remove legacy styles
only when no consumer remains.

## Maintaining the kit in Figma

The remaining component transfer and every later update are controlled mirrors,
not detached redesigns:

1. Freeze and tag a known code version.
2. Import the three collections from
   `design-tokens/generated/color-variables.figma.json`. Preserve each
   variable's `description`, `scopes`, and `hiddenFromPublishing` values exactly;
   primitives and aliases stay hidden, semantic variables are public.
3. Create text styles from the code roles and verify the actual iOS/system font
   metrics on representative screens.
4. Create components whose variants match React props: button variant/size and
   state, icon button, field state, surface variant, tab selection, and badge
   variant.
5. Bind all component values to variables; avoid detached fills and arbitrary
   spacing.
6. Compare Figma and code at 390 px and 430 px widths before declaring parity.
7. Record the mirrored code commit in the Figma library description.

Use only fictional showcase text and placeholders during the transfer. Do not
upload decrypted photographs, personal video, certificate codes, passwords,
vault output, analytics identifiers, or real user data into Figma. The code
remains authoritative until parity is explicitly approved; after that, changes
must be reconciled deliberately rather than silently drifting in either tool.
