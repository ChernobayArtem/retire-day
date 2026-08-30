import { describe, expect, it } from 'vitest'

// `?raw` rather than node:fs: this file is type-checked against the browser lib
// the app uses, where Node modules do not exist. Vite inlines the text at build.
import daysSource from './days.ts?raw'
import auditSource from '../../scripts/audit-vault.mjs?raw'

/**
 * The day schema is written twice: once as the `DayDef` interface the app is
 * typed against, and once as plain lists in `scripts/audit-vault.mjs`, which
 * validates the decrypted content before a release. The audit cannot import the
 * TypeScript, so the two are kept in step by hand.
 *
 * Until now nothing checked that. Drift is only caught later and indirectly —
 * when some day's content happens to use the field or category that one side
 * does not know about. These tests make the mismatch fail immediately and say
 * which side is behind, which matters as soon as new categories start arriving.
 */

function interfaceFields(name: string): string[] {
  const body = new RegExp(`export interface ${name} \\{(.*?)\\n\\}`, 's').exec(daysSource)
  if (!body) throw new Error(`interface ${name} not found in days.ts`)
  return [...body[1].matchAll(/^ {2}(\w+)\??:/gm)].map((m) => m[1]).sort()
}

function setLiteral(source: string, name: string): string[] {
  const block = new RegExp(`const ${name} = new Set\\(\\[(.*?)\\]\\)`, 's').exec(source)
  if (!block) throw new Error(`${name} not found`)
  return [...block[1].matchAll(/'(\w+)'/g)].map((m) => m[1]).sort()
}

function unionMembers(name: string): string[] {
  const line = new RegExp(`export type ${name} =([^\\n]+(?:\\n\\s+\\|[^\\n]+)*)`).exec(daysSource)
  if (!line) throw new Error(`type ${name} not found`)
  return [...line[1].matchAll(/'(\w+)'/g)].map((m) => m[1]).sort()
}

describe('day schema stays in step with the vault audit', () => {
  it('declares the same categories on both sides', () => {
    // Adding a category means touching DayCategory and DAY_CATEGORIES together.
    expect(setLiteral(auditSource, 'DAY_CATEGORIES')).toEqual(unionMembers('DayCategory'))
  })

  it('declares the same day fields on both sides', () => {
    // A field the audit does not know about is rejected as an unexpected key
    // once some day actually uses it; this catches it at the source instead.
    expect(setLiteral(auditSource, 'DAY_KEYS')).toEqual(interfaceFields('DayDef'))
  })
})

describe('archive categories cover the content model', () => {
  it('offers a tab for every category a day can declare', async () => {
    const { ARCHIVE_CATEGORIES } = await import('../lib/dayCategories')
    const tabs = ARCHIVE_CATEGORIES.map((category) => category.id).sort()
    // A category with no tab would hide those days from the archive entirely.
    expect(tabs).toEqual(unionMembers('DayCategory'))
  })
})
