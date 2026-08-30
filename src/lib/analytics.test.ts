import { describe, expect, it } from 'vitest'

import appSource from '../App.tsx?raw'
import homeSource from '../components/Home.tsx?raw'
import gateSource from '../components/Gate.tsx?raw'
import archiveSource from '../components/SurpriseArchive.tsx?raw'

/**
 * Analytics is the only channel that carries anything off the device, so what it
 * may carry is a boundary rather than a detail. Today every call sends structural
 * values only — a day number, a category slug, a source, and fixed titles like
 * "День 5" or "Архив · Комплименты". Nothing a person wrote ever leaves.
 *
 * That holds by care, not by construction, and care is the thing that slips once
 * content stops being written in this repository and starts arriving from other
 * people. These tests fail the moment a content-bearing field reaches a call, so
 * the privacy claim stays a fact instead of an intention.
 */

const CALL_SITES: Array<[string, string]> = [
  ['App.tsx', appSource],
  ['Home.tsx', homeSource],
  ['Gate.tsx', gateSource],
  ['SurpriseArchive.tsx', archiveSource],
]

/** Fields on a day that hold something a person wrote or chose. */
const CONTENT_FIELDS = [
  'title',
  'compliment',
  'compliments',
  'wish',
  'claim',
  'desc',
  'caption',
  'value',
  'brand',
  'where',
  'when',
  'poster',
  'photos',
  'collage',
]

/** Every argument list passed to trackView / trackGoal in a file. */
function analyticsArguments(source: string): string[] {
  const found: string[] = []
  const call = /\b(?:trackView|trackGoal)\s*\(/g
  while (call.exec(source) !== null) {
    // Walk to the matching close paren so nested calls and template literals
    // are captured whole rather than cut at the first comma.
    let depth = 1
    let i = call.lastIndex
    while (i < source.length && depth > 0) {
      if (source[i] === '(') depth += 1
      else if (source[i] === ')') depth -= 1
      i += 1
    }
    found.push(source.slice(call.lastIndex, i - 1))
  }
  return found
}

describe('analytics carries no personal content', () => {
  it('finds the call sites it claims to guard', () => {
    // Guards against the regex silently matching nothing and passing forever.
    const total = CALL_SITES.reduce((n, [, src]) => n + analyticsArguments(src).length, 0)
    expect(total).toBeGreaterThan(5)
  })

  for (const [name, source] of CALL_SITES) {
    it(`sends no content-bearing field from ${name}`, () => {
      for (const args of analyticsArguments(source)) {
        for (const field of CONTENT_FIELDS) {
          expect(
            args.includes(`.${field}`),
            `analytics call in ${name} reads .${field}: ${args}`,
          ).toBe(false)
        }
      }
    })
  }

  it('keeps the day view keyed by number rather than by its title', () => {
    // `День ${day}` is safe; the day's own title is not.
    const dayView = analyticsArguments(homeSource).find((args) => args.includes('day-'))
    expect(dayView).toBeDefined()
    expect(dayView).not.toMatch(/\.title/)
  })
})
