// Target size contract — WCAG 2.2 SC 2.5.8 Target Size (Minimum), level AA.
//
// Contrast is machine-checked against an explicit contract; target size was not,
// even though the kit deliberately ships one control below the minimum. This
// contract closes that gap: every interactive control declares the size it
// resolves to, and anything under the minimum has to name the exception that
// allows it and prove the geometry that exception depends on.

/** WCAG 2.2 SC 2.5.8 minimum target, in CSS pixels. */
export const MIN_TARGET_SIZE = 24

/**
 * Interactive controls whose size comes from the UI kit stylesheet.
 *
 * `height` / `width` name the CSS declaration the audit resolves through the
 * token layers. A control that omits `width` is text-sized on that axis and
 * only its height is enforced.
 */
export const targets = Object.freeze([
  {
    id: 'button-md',
    selector: '.ui-button',
    height: 'var(--ui-button-height-md)',
    note: 'Default button; the label makes it wider than the minimum.',
    enforcement: 'required',
  },
  {
    id: 'button-sm',
    selector: '.ui-button--sm',
    height: 'var(--ui-button-height-sm)',
    note: 'Compact button, still a full control perimeter.',
    enforcement: 'required',
  },
  {
    id: 'icon-button-md',
    selector: '.ui-icon-button',
    height: 'var(--ui-icon-button-size-md)',
    width: 'var(--ui-icon-button-size-md)',
    note: 'Standalone icon control.',
    enforcement: 'required',
  },
  {
    id: 'icon-button-sm',
    selector: '.ui-icon-button--sm',
    height: 'var(--ui-icon-button-size-sm)',
    width: 'var(--ui-icon-button-size-sm)',
    note: 'Compact standalone icon control.',
    enforcement: 'required',
  },
  {
    id: 'tab',
    selector: '.ui-tab',
    height: 'var(--ui-layout-control-sm)',
    note: 'Tab strip item; padding makes it wider than the minimum.',
    enforcement: 'required',
  },
  {
    id: 'text-field',
    selector: '.ui-text-field__control',
    height: 'var(--ui-field-height)',
    note: 'Field control; full width in every layout that uses it.',
    enforcement: 'required',
  },
])

/**
 * Controls allowed below the minimum, each through a named WCAG exception.
 *
 * `spacing` describes the geometry the exception depends on. For the inline
 * exception the audit checks the undisturbed circle rule: stacked instances
 * must keep at least MIN_TARGET_SIZE between their centres, and the centre
 * distance is the row height plus the gap between rows. A row is never shorter
 * than the control it contains, so `size + gap >= MIN_TARGET_SIZE` is the
 * conservative form of that check.
 */
export const exceptions = Object.freeze([
  {
    id: 'inline-icon-link',
    selector: '.ui-icon-link',
    size: '20px',
    exception: 'spacing',
    reason:
      'Compact inline copy action that belongs to the code beside it. It never ' +
      'stands alone in a control bar; a standalone action uses IconButton.',
    spacing: [
      {
        context: 'certificate code rows in the day sheet',
        gap: 'var(--spacing-semantic-content-text-gap)',
      },
      {
        context: 'certificate code rows in the archive card',
        gap: 'var(--spacing-semantic-layout-inline-gap)',
      },
    ],
    // Measured on a rendered page with the real stylesheets; see docs/UI_KIT.md.
    measuredCentreDistance: { sheet: 29.5, archive: 56 },
  },
])
