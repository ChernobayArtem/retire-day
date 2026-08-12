# Color contrast

## Accessibility target

The production palette is checked against WCAG 2.2 Level AA:

- normal text: at least `4.5:1`;
- large text: at least `3:1` (24 CSS px regular or 18.667 CSS px bold and larger);
- meaningful icons, control boundaries and visible states: at least `3:1`;
- translucent overlays are composited over their real backdrop before the ratio is calculated;
- media controls are tested against a white image as the conservative worst case.

The machine-readable source of truth is
`design-tokens/color-contrast-contract.mjs`. It records real selectors, semantic
foreground/background tokens, classification, threshold and any documented
exemption. The calculator is `scripts/audit-color-contrast.mjs`.

## Current result

`npm run audit:contrast:strict` checks 72 real foreground/background pairs.
All 72 currently meet WCAG 2.2 AA. Nine exemption groups are recorded explicitly;
nothing is skipped implicitly.

`npm run audit:contrast:coverage` separately discovers semantic foreground,
icon, boundary and focus roles that are actually consumed by product code. The
current coverage is 69 roles: 48 required numeric checks, 21 documented
exemptions and 0 missing roles. This prevents a new role from bypassing the
contrast contract simply because nobody remembered to add a pair manually.

Selected narrow passing pairs:

| Pair | Ratio | Requirement |
| --- | ---: | ---: |
| Lightbox control, white icon over the worst-case translucent background | `3.037:1` | `3:1` |
| Text-field boundary on level-1 | `3.267:1` | `3:1` |
| Default outline-control boundary on white | `3.452:1` | `3:1` |
| Outline-control hover boundary on white | `3.452:1` | `3:1` |
| Inactive carousel indicator on white | `3.452:1` | `3:1` |
| Focus ring on white | `3.589:1` | `3:1` |
| Video play icon over the worst-case translucent background | `4.759:1` | `3:1` |
| Lightbox hint over the worst-case translucent background | `4.759:1` | `4.5:1` |
| Soft-button text in hover state | `4.792:1` | `4.5:1` |
| Inactive tab text on white | `4.807:1` | `4.5:1` |
| Calendar number on the future-day surface | `4.999:1` | `4.5:1` |

These narrowest pairs are intentional contract entries. Any later token change
that drops them below the target fails the build.

## Accessible palette decisions

The bright brand pink `#FF5E61` remains available for decorative accents. It is
not used for small text, functional icons or required control states.

| Role | Value | Rule |
| --- | --- | --- |
| Accessible brand | `#A93235` | Brand text, danger text, functional brand icons, progress state, primary controls and required brand strokes |
| Accessible brand strong | `#8F2930` | Hover and pressed brand controls |
| Message surface | `#006FC9` | iMessage-style bubble behind white text |
| Accessible muted text | `#6E676C` | Muted, caption, subtle, faint, metadata, code label, calendar number and progress label roles |
| Control stroke | `#8A8A8A` | Enabled buttons, icon buttons, tabs and text-field boundaries; decorative dividers remain light |
| Focus ring | `rgba(169, 50, 53, 0.70)` | Three-pixel focus indicator on every light surface |
| Media hint overlay | `rgba(0, 0, 0, 0.55)` | Guarantees white small text over a worst-case white image |

Mutedness must be expressed by an explicit semantic foreground. Do not reduce
the opacity of a whole enabled control: it changes text, icon and border contrast
at the same time and is reserved for disabled/inactive UI only.

## Exemptions

The following are exempt under WCAG or decorative by construction, and the
contract describes the reason for each group:

- disabled controls and disabled field content — inactive component exemption;
- light decorative/redundant boundaries whose structure is already conveyed by spacing, surface or accessible content;
- media-control rings whose audited dark surface and inverse icon already provide the control boundary;
- transient loader strokes that do not carry content or identify a control;
- category accent colours — decorative identity with the category label available independently;
- dividers, progress connector, skeleton shimmer, shadows and gradients — decoration only;
- decorative interface shapes such as speech-bubble tails, tooltip pointers and artwork fills;
- empty-state brand icon — `aria-hidden` and duplicated by adjacent copy;
- photographs, video posters, company logos and code-authored illustrations — artwork; controls above media are audited separately with worst-case backdrops.

Disabled tokens must never be reused for enabled labels or metadata.

## Commands

- `npm run audit:contrast` — every non-exempt pair must meet AA.
- `npm run audit:contrast:strict` — the explicit production alias used by the
  build; it enforces the same complete contract.
- `npm run audit:contrast:coverage` — proves that every consumed semantic
  foreground, icon, control-boundary and focus role is required or explicitly exempt.
- `node scripts/audit-color-contrast.mjs --json` — complete machine-readable
  result with selectors, ratios, requirements, exemptions and actual accessible values.

The production `npm run build` runs both the structural colour-token audit and
the strict contrast audit before TypeScript and Vite.
