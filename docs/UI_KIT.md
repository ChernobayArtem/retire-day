# ридэй UI kit

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

The machine-readable contract lives in
`design-tokens/spacing-contract.mjs`; its derived Figma registry is
`design-tokens/generated/spacing-variables.figma.json`. The human proximity
rules live in [`docs/SPACING_SYSTEM.md`](SPACING_SYSTEM.md). Product code uses
only readable `--spacing-semantic-*` roles. The system has a compact primitive
scale, hidden aliases, and public semantic roles so an app with a different
number of days never acquires screen- or day-specific values.

- A component owns internal padding and inner cluster gaps; its parent owns
  only the gap to neighbouring components.
- Use a wrapper with semantic `gap`, not individual child margins, to express a
  group.
- Elements that belong together use 4–12px; an independent block begins at
  16px, a section at 24px, a large page inset at 32px, and an empty state at
  48px.
- The icon and label inside a button form one compact cluster. Do not push them
  apart with `space-between` or absolute positioning.
- App width, content width, gutters, control heights, and safe areas keep their
  own layout/dimension tokens; safe-area and media-crop geometry are not a
  reason to add product spacing values.

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

The kit uses the single **Onest** family from Google Fonts through
`--ui-font-sans` and `--ui-font-display`. Both variables intentionally resolve
to Onest so the product has one consistent typographic voice; `sans-serif` is
only a browser fallback when the font request is unavailable. The numeric
weight scale is `100, 200, 300, 400, 500, 600, 700, 800, 900`.

Designer-facing style names are readable lowercase kebab-case (`display`,
`title`, `heading`, `body`, `label`, `caption`). The numbers are only the
foundation scale; use the semantic role or readable aliases such as
`regular`, `medium`, `semibold`, `bold` and `heavy` in day-to-day work. Figma
may use `/` as a visual hierarchy separator (`typography/headings/heading`),
but every segment remains lowercase kebab-case.

Use roles instead of selecting arbitrary font sizes:

| Role    | Use                                                         |
| ------- | ----------------------------------------------------------- |
| Display | One primary expressive heading on a screen                  |
| Title   | Screen and sheet titles                                     |
| Heading | Card and section headings                                   |
| Body    | Reading text and descriptions                               |
| Label   | Buttons, tabs, fields, and compact actions                  |
| Caption | Supporting explanations, hints, dates, counts, and metadata |

Each role is a combination of the `--ui-font-size-*`,
`--ui-font-weight-*`, `--ui-line-height-*`, and
`--ui-letter-spacing-*` scales. Do not override only the font size while
leaving an unrelated line height. Use no more than one display role per view,
and keep muted colour separate from typographic hierarchy.

Dynamic Russian copy uses `keepRussianShortWords()` from
`src/lib/typography.ts`; this keeps short conjunctions and prepositions with
the following word. Do not add manual line breaks to ordinary prose.

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

The `md` button renders its label at `subtitle` (17px, `medium`) rather than the
`label` role that governs tabs, inputs and `.ui-button--sm`. That divergence is
deliberate and is justified in `docs/TYPOGRAPHY_SYSTEM.md`; keep the two
documents in step if the size changes.

### IconButton

Use `IconButton` only when the icon is a familiar action in context. Every icon
button requires a concise `aria-label`; a tooltip is supplementary, not a
replacement for its accessible name. Its variants are `outline`, `primary`,
`soft`, `action`, and `ghost`; sizes are `sm` and `md`. Use it for a standalone
control with a perimeter of at least 44px (the current `sm` and `md` controls
are 44px and 51px respectively). Use `loading` while an icon-only action is in
progress.

### IconLink

`IconLink` is the compact no-padding inline variant for a familiar action that
belongs directly to adjacent content, such as copying a certificate code. It
is a semantic HTML `button`, not a navigation link, and has a visible 20px
icon only, so it must have a concise `aria-label`. Keep it at the standard 8px
gap from the value it operates on. Its compact target is allowed only through
the inline-target exception: it must sit directly beside that value, never
alone in a control bar. Do not use it as a general touch control or standalone
primary action; use `IconButton` when the action needs its own 44px-or-larger
control perimeter.

### TextField

`TextField` owns its label, hint, error, icon positions, focus, and disabled
states. Use `label` whenever the field's purpose is not already permanently
visible. An error replaces supporting guidance and must explain how to recover.
Placeholders are examples, not labels. The only label-less exception is a
field whose purpose is permanently obvious in the surrounding UI: it still
needs a concise `aria-label`. Its 17px input text is a documented iOS
Safari/PWA focus-zoom prevention exception, not an additional text role.

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
an explicit `selected` state. The kit supports one horizontal, scrollable tab
pattern; do not create a vertical variation without a real product consumer.
Use `badge` only for compact tab metadata such as an available-item count. Tabs
are not filters, buttons for unrelated actions, or a way to reveal unreleased
surprise categories.

### Badge

`Badge` is compact metadata. The `neutral` variant is informational; `accent`
highlights a meaningful current status. It must not carry essential information
through colour alone.

### Product patterns

- `CopyAction` owns the copy/copy-complete labels and canonical copy/check
  icons while the product remains responsible for the clipboard operation. It
  inherits `Button`'s `variant` and `size`, and announces copy completion to
  assistive technology.
- `SheetFooter` owns the paired previous/close controls used by day sheets.
- `EmptyState` owns the proximity and type hierarchy of empty collections.
  It deliberately has no action slot: put a context-specific action beside the
  state in its parent instead of turning an empty state into a generic card.

## Catalogue coverage

`UIKitShowcase` is deliberately a compact contract catalogue, not a second
application. It shows the states that the product actually uses or can reuse:

| Family              | Catalogue coverage                                                                 |
| ------------------- | ---------------------------------------------------------------------------------- |
| Foundations         | Semantic surface hierarchy, proximity rule, control/motion contract                |
| Button              | All six variants; `sm`, disabled, loading and full-width states                    |
| IconButton          | All five variants; `sm`, disabled and loading states                               |
| IconLink            | Real code cluster, copied feedback and disabled state                              |
| TextField           | Label, hint, icons, read-only, error and disabled states                           |
| Tabs and Badge      | Horizontal selection, icon and compact count badge                                 |
| Surface and Divider | All four surfaces plus horizontal and vertical separation                          |
| Product patterns    | Default, first-day and locked `SheetFooter`; compact and regular copy; empty state |

Do not add a showcase example merely to enumerate every theoretical prop
combination. Add one only when the product uses it or it is an intentional,
documented reusable contract.

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

## Target size

Every interactive control must satisfy WCAG 2.2 SC 2.5.8 Target Size (Minimum):
at least 24x24 CSS pixels, or a documented exception. `IconLink` is the only
control below that minimum and relies on the spacing exception, which requires
24px between the centres of adjacent targets.

`design-tokens/target-size-contract.mjs` declares each control and the size it
resolves to, and `npm run audit:target-size` enforces it as part of the build.
The audit resolves token chains the way the browser does, so shrinking a control
token, tightening the gap between stacked code rows, or adding a new control to
`src/ui/ui.css` without declaring it all fail the build.

Measured on a rendered page with the real stylesheets, identically at 320/390/430:

| Context                             | Control | Centre distance | Requirement |
| ----------------------------------- | ------- | --------------- | ----------- |
| Certificate row in the day sheet    | 20x20   | 29.50px         | 24px        |
| Certificate row in the archive card | 20x20   | 56px            | 24px        |

The static audit checks the conservative form of that geometry — control size
plus row gap — because a row is never shorter than the control inside it. When
the code type scale or the row gap changes, re-measure and update the contract.

## Icon alignment

A `md` button carries 17px text with a 20px icon. An inline icon reads as a
cap-height object, so it is deliberately a little taller than the label beside
it rather than matched to the type size.

No optical correction is applied, and that is a measured decision rather than an
omission. In Onest the baseline sits `(ascent - descent) / 2` below the centre
of the line box, which lands within 0.5px of the cap-height centre — so the
geometrically centred icon is already optically centred. Correcting towards the
ink centre of a whole string instead is wrong: descenders in words like
"Предыдущий" drag that centre down and push the icon visibly low.

When judging alignment by eye, compare the icon centre with the centre of the
capital letters, not with the centre of the text box or of the glyph ink.

Because the button text is at its full size, the two `SheetFooter` labels stop
fitting beside their icons below 360px. Trimming the gap or the icon does not
recover enough room, so the footer drops the icons there and keeps the labels
whole. Verified at 320/390/430 with no truncation and no horizontal overflow.

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
2. Import the three colour collections from
   `design-tokens/generated/color-variables.figma.json` and the three spacing
   collections from `design-tokens/generated/spacing-variables.figma.json`.
   Preserve each variable's
   `description`, `scopes`, code syntax, alias/value, and
   `hiddenFromPublishing` values exactly; primitives and aliases stay hidden,
   semantic variables are public.
3. Create text styles from the code roles and verify the actual iOS/system font
   metrics on representative screens.
4. Create components whose variants match React props: button variant/size and
   state, icon button, field state, surface variant, tab selection, and badge
   variant.
5. Bind all component values to variables; use only public semantic spacing and
   avoid detached fills or arbitrary spacing.
6. Compare Figma and code at 320 px, 390 px, and 430 px widths before
   declaring parity.
7. Record the mirrored code commit in the Figma library description.

Use only fictional showcase text and placeholders during the transfer. Do not
upload decrypted photographs, personal video, certificate codes, passwords,
vault output, analytics identifiers, or real user data into Figma. The code
remains authoritative until parity is explicitly approved; after that, changes
must be reconciled deliberately rather than silently drifting in either tool.
