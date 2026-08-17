# Typography system

## Purpose

This document is the source of truth for readable text styles in the PWA and
for the typography rules shared by Codex, Claude and Figma. The system is
intentionally small: one typeface, one numeric foundation, and a short list of
semantic roles. A new screen must reuse these roles instead of creating a
screen-specific text style.

## Source of truth

- Font, size, weight, line-height and tracking primitives:
  `src/ui/tokens/foundations.css`.
- Reusable semantic role classes: `src/ui/ui.css` (`.ui-type-*`).
- Dynamic Russian copy wrapping: `src/lib/typography.ts`.
- Product-specific exceptions: `src/styles/app.css`; they must still resolve
  to the same foundation tokens wherever a token exists.
- Human-readable kit and examples: `docs/UI_KIT.md` and
  `src/ui/UIKitShowcase.tsx`.

## Typeface

The only product typeface is **Onest**, loaded from Google Fonts. The CSS
fallback `sans-serif` is an availability fallback, not a second design choice.
Do not introduce SF Pro, Inter, Arial, system-ui or another web font into the
product UI. If the project later needs a fully offline font, self-host the
same Onest family and keep the role contract unchanged.

## Three layers

Typography follows the same three-layer model as color:

1. **Primitives** — the Onest family, numeric weights `100`–`900`, size scale,
   line-height scale and letter-spacing scale. These describe capability, not
   a component.
2. **Aliases** — readable decisions such as regular, medium, semibold, bold,
   heavy and black. They map to the numeric primitives so a global adjustment
   has one place to change.
3. **Semantics** — the six roles used by components: display, title, heading,
   body, label and caption. In code these are `.ui-type-display`,
   `.ui-type-title`, `.ui-type-heading`, `.ui-type-body`, `.ui-type-label` and
   `.ui-type-caption`.

The numeric foundation remains available for exceptional art direction, but a
designer should normally choose a semantic role or a readable weight alias,
not guess between `100` and `200`.

## Readable names

All new token, style and documentation identifiers use lowercase kebab-case:
`heading-strong`, `body`, `caption`, `font-weight-semibold`.

- No CamelCase, PascalCase, snake_case, spaces or opaque numeric-only names.
- A number is allowed only when it is an actual measurable primitive, such as
  `font-weight-700` or `space-4`.
- In Figma, `/` may be used only as a visual collection hierarchy separator
  (`typography/headings/heading`); each segment still uses lowercase kebab-case.
- Existing readable names are reused. Do not rename a token merely to create a
  new synonym; migrate only when the current name is ambiguous or numeric-only.

## Semantic role guidance

| Role | Default purpose | Typical weight | Guidance |
| --- | --- | --- | --- |
| `display` | One expressive hero statement per view | `heavy` (800) | Use sparingly; never for paragraphs. |
| `title` | Screen, sheet or major card title | `bold` (700) | The main navigation/content title. |
| `heading` | Section and card heading | `bold` (700) | Use for grouping, not for every emphasized word. |
| `body` | Reading copy, descriptions and wishes | `regular` (400) | Default readable text; keep line-height relaxed. |
| `label` | Buttons, tabs, inputs and compact actions | `semibold` (600) | Keep labels short and action-oriented. |
| `caption` | Dates, hints, metadata and supporting notes | `bold` (700) | Use only for secondary information; do not reduce body copy to caption. |

If a heading needs two or three strengths, keep one semantic role and add a
documented state/variant (`heading-regular`, `heading-strong`) only when the
meaning is genuinely different. Do not add `heading-2`, `heading-3`,
`heading-new` or a one-off screen name. If two styles have the same family,
size, line-height, tracking and meaning, merge them.

## Readability rules

- Body text is 14px in the current mobile product; increase size for content
  that needs reading comfort rather than using a lighter weight.
- Prefer `regular` or `medium` for continuous text. Reserve `heavy`/`black`
  for short headings and numbers.
- Use at most two weights inside one visual block unless the hierarchy really
  requires a third level.
- Keep body line-height at `body` or `relaxed`; do not pair a small size with a
  tight line-height.
- Do not use letter-spacing to compensate for a wrong font size or weight.
- Keep color hierarchy separate from typography hierarchy: use semantic color
  tokens rather than inventing a new text style for muted content.
- `TextField` uses the existing 17px `subtitle` foundation only as a documented
  platform exception that prevents iOS Safari/PWA focus zoom. It is not a
  seventh semantic type role and must not be reused as an ad-hoc text style.

## Russian line wrapping

Visible Russian copy must pass through `keepRussianShortWords()` from
`src/lib/typography.ts` before rendering. The helper inserts non-breaking
spaces after short conjunctions and prepositions and preserves the original
string for copying/analytics. It covers words such as `а`, `и`, `но`, `или`,
`что`, `как`, `для`, `из`, `к`, `на`, `по`, `с`, `у`, `от`, `до`, `же` and
related service words.

CSS `text-wrap: pretty` may be used as a supplementary browser hint, but it is
not a replacement for the helper. Do not manually add `<br>` to ordinary
prose: manual breaks are reserved for intentional creative copy and explicit
design compositions.

## Maintainer checklist

Before accepting a typography change, the maintainer checks:

1. Can an existing semantic role or variant express it? If yes, reuse it.
2. Is the identifier lowercase kebab-case and meaningful without opening the
   implementation?
3. Does it use Onest and the shared numeric/alias scales?
4. Does dynamic Russian copy use `keepRussianShortWords()`?
5. Does the change preserve readable line-height, contrast and mobile wrapping?
6. If a new style is truly necessary, is its semantic purpose documented here
   and in the UI kit rather than added only to one screen?

Run `npm run audit:typography`, `npm run typecheck` and the normal release
verification after changing the system. Figma text styles should mirror the
same six roles and names; do not upload personal content to the library.
