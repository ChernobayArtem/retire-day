import { describe, it, expect } from 'vitest'

import {
  buildGrid,
  dayDate,
  daysUntilTarget,
  diffDays,
  getNow,
  isAfterTarget,
  newChapterPeriod,
  stateForDay,
} from './dates'

const d = (iso: string) => {
  const [y, m, day] = iso.split('-').map(Number)
  return new Date(y, m - 1, day)
}

describe('getNow', () => {
  it('parses a valid YYYY-MM-DD override to local midnight', () => {
    const now = getNow('2026-08-10')
    expect(now.getFullYear()).toBe(2026)
    expect(now.getMonth()).toBe(7)
    expect(now.getDate()).toBe(10)
    expect(now.getHours()).toBe(0)
  })

  it('falls back to today at midnight when the override is missing or malformed', () => {
    expect(getNow('not-a-date').getHours()).toBe(0)
    expect(getNow(null)).toBeInstanceOf(Date)
    expect(getNow(null).getHours()).toBe(0)
  })
})

describe('diffDays', () => {
  it('counts whole days as b - a', () => {
    expect(diffDays(d('2026-08-01'), d('2026-08-29'))).toBe(28)
    expect(diffDays(d('2026-08-29'), d('2026-08-01'))).toBe(-28)
    expect(diffDays(d('2026-08-10'), d('2026-08-10'))).toBe(0)
  })

  it('counts across a month boundary', () => {
    expect(diffDays(d('2026-08-31'), d('2026-09-01'))).toBe(1)
  })
})

describe('daysUntilTarget and isAfterTarget', () => {
  it('is 28 on Aug 1, 0 on the finale, negative after', () => {
    expect(daysUntilTarget(d('2026-08-01'))).toBe(28)
    expect(daysUntilTarget(d('2026-08-29'))).toBe(0)
    expect(daysUntilTarget(d('2026-08-30'))).toBe(-1)
  })

  it('treats the finale day itself as not yet after the target', () => {
    expect(isAfterTarget(d('2026-08-29'))).toBe(false)
    expect(isAfterTarget(d('2026-08-30'))).toBe(true)
  })
})

describe('stateForDay', () => {
  const now = d('2026-08-10')

  it('classifies a day as past, today or future relative to now', () => {
    expect(stateForDay(5, now)).toBe('past')
    expect(stateForDay(10, now)).toBe('today')
    expect(stateForDay(15, now)).toBe('future')
  })
})

describe('dayDate', () => {
  it('builds a date in the fixed target month', () => {
    const day = dayDate(15)
    expect(day.getFullYear()).toBe(2026)
    expect(day.getMonth()).toBe(7)
    expect(day.getDate()).toBe(15)
  })
})

describe('buildGrid', () => {
  const grid = buildGrid()

  it('is Monday-first with five leading pads (Aug 1 2026 is Saturday)', () => {
    expect(grid.slice(0, 5)).toEqual([null, null, null, null, null])
    expect(grid[5]).toBe(1)
  })

  it('ends on the target day and pads out to whole weeks', () => {
    expect(grid.length).toBe(35)
    expect(grid.length % 7).toBe(0)
    expect(grid[33]).toBe(29)
    expect(grid[34]).toBeNull()
    expect(grid.filter((cell) => cell !== null)).toHaveLength(29)
  })
})

describe('newChapterPeriod', () => {
  it('greets the first day of the new chapter', () => {
    expect(newChapterPeriod(d('2026-08-30')).label).toBe('Новая глава началась сегодня')
  })

  it('counts days with the right Russian plural under a week', () => {
    expect(newChapterPeriod(d('2026-09-01')).label).toBe('Уже 2 дня новой главы')
    expect(newChapterPeriod(d('2026-09-04')).label).toBe('Уже 5 дней новой главы')
  })

  it('switches to weeks before a full calendar month', () => {
    expect(newChapterPeriod(d('2026-09-06')).label).toBe('Уже 1 неделя новой главы')
  })

  it('switches to calendar months', () => {
    expect(newChapterPeriod(d('2026-10-30')).label).toBe('Уже 2 месяца новой главы')
  })

  it('switches to years and months so it never shouts a huge day count', () => {
    expect(newChapterPeriod(d('2027-08-30')).label).toBe('Уже 1 год новой главы')
    expect(newChapterPeriod(d('2027-11-02')).label).toBe('Уже 1 год и 2 месяца новой главы')
  })
})
