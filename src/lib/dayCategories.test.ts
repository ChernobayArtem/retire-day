import { describe, expect, it } from 'vitest'

import type { DayDef } from '../content/days'
import { ARCHIVE_CATEGORIES, calendarEmoji, categoryAccent, categoryForDay } from './dayCategories'

/**
 * `categoryForDay` is the service-worker migration adapter. After an update an
 * installed PWA can run the new JS against a content.bin that is still cached
 * from before, so days may arrive without the `category` field the current
 * source guarantees. The fallbacks below are what keeps those days in the right
 * archive tab and the right accent colour during that window — and it is exactly
 * the window Lera passes through on every deploy.
 *
 * Everything downstream (`categoryAccent`, `calendarEmoji`, the archive tabs)
 * routes through this one function, so a wrong branch here is wrong everywhere.
 */

const base: DayDef = {
  day: 1,
  title: 'Fixture',
  category: 'compliment',
  emoji: '🙂',
}

/** A day as an older content.bin would hold it: no `category` at all. */
function legacy(fields: Partial<DayDef> & Record<string, unknown>): DayDef {
  const day: Record<string, unknown> = { ...base, ...fields }
  delete day.category
  return day as unknown as DayDef
}

describe('categoryForDay', () => {
  it('trusts an explicit category over anything inferred from the fields', () => {
    // A hybrid day — a compliment that also carries a certificate — must stay
    // where the author put it rather than being re-sorted by its contents.
    const day = { ...base, category: 'compliment' as const, cert: { codes: [{ value: 'X' }] } }
    expect(categoryForDay(day)).toBe('compliment')
  })

  it('ignores a category that is not a real one and falls back', () => {
    const day = {
      ...base,
      category: 'music' as unknown as DayDef['category'],
      video: { poster: 'p' },
    }
    expect(categoryForDay(day)).toBe('video')
  })

  describe('content without a category, as an older cache serves it', () => {
    it('reads a single compliment', () => {
      expect(categoryForDay(legacy({ compliment: 'text' }))).toBe('compliment')
    })

    it('reads a list of compliments', () => {
      expect(categoryForDay(legacy({ compliments: ['a', 'b'] }))).toBe('compliment')
    })

    it('reads a video', () => {
      expect(categoryForDay(legacy({ video: { poster: 'p' } }))).toBe('video')
    })

    it('reads a booking as a restaurant', () => {
      expect(categoryForDay(legacy({ booking: { card: 'c', when: 'w', where: 'w' } }))).toBe(
        'restaurant',
      )
    })

    it('reads a coupon', () => {
      expect(categoryForDay(legacy({ coupon: { title: 't', desc: 'd', claim: 'c' } }))).toBe(
        'coupon',
      )
    })

    it('reads a certificate', () => {
      expect(categoryForDay(legacy({ cert: { codes: [{ value: 'X' }] } }))).toBe('cert')
    })

    it('reads a collage and a photo list as photos', () => {
      expect(categoryForDay(legacy({ collage: 'c' }))).toBe('photos')
      expect(categoryForDay(legacy({ photos: ['a'] }))).toBe('photos')
    })

    it('honours the retired `type` field the oldest content used', () => {
      expect(categoryForDay(legacy({ type: 'intro' }))).toBe('compliment')
      expect(categoryForDay(legacy({ type: 'cert' }))).toBe('cert')
      expect(categoryForDay(legacy({ type: 'photo' }))).toBe('photos')
    })

    it('settles on a compliment when a day says nothing at all', () => {
      // Better a readable tab than an empty one: never leave a day uncategorised.
      expect(categoryForDay(legacy({}))).toBe('compliment')
    })
  })
})

describe('what the category drives', () => {
  it('gives every category an accent colour', () => {
    for (const { id } of ARCHIVE_CATEGORIES) {
      const accent = categoryAccent({ ...base, category: id })
      expect(accent, `no accent for ${id}`).toBeTruthy()
    }
  })

  it('uses the category icon on the calendar where one exists', () => {
    expect(calendarEmoji({ ...base, category: 'video' })).toBe('🎥')
  })

  it('falls back to the day emoji for a category with no icon', () => {
    // Certificates carry brand logos, so the tab deliberately has no shared icon.
    expect(calendarEmoji({ ...base, category: 'cert', emoji: '🎁' })).toBe('🎁')
  })

  it('has something to draw for a day that does not exist yet', () => {
    expect(calendarEmoji(undefined)).toBe('🌸')
  })
})
