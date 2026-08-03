import { YEAR, MONTH_INDEX, TARGET_DAY, START_DAY } from '../config'

export type DayState = 'past' | 'today' | 'future'

const MS_PER_DAY = 86400000

/** Current local date at midnight, honoring an optional test override (YYYY-MM-DD). */
export function getNow(override?: string | null): Date {
  if (override) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(override)
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  }
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function dayDate(day: number): Date {
  return new Date(YEAR, MONTH_INDEX, day)
}

/** Whole days from a to b (b - a). */
export function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY)
}

/** Days from now until Aug 29 (28 on Aug 1, 0 on Aug 29, negative after). */
export function daysUntilTarget(now: Date): number {
  return diffDays(now, dayDate(TARGET_DAY))
}

/** The finale itself stays on Aug 29; the epilogue starts the next day. */
export function isAfterTarget(now: Date): boolean {
  return daysUntilTarget(now) < 0
}

/** Aug 30 is day 1 of the new chapter, continuing across month/year boundaries. */
export function newChapterDay(now: Date): number {
  return Math.max(1, diffDays(dayDate(TARGET_DAY + 1), now) + 1)
}

export function isBeforeStart(now: Date): boolean {
  return diffDays(dayDate(START_DAY), now) < 0
}

export function stateForDay(day: number, now: Date): DayState {
  const rel = diffDays(dayDate(day), now) // now - day
  if (rel > 0) return 'past'
  if (rel === 0) return 'today'
  return 'future'
}

const WD_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
export function weekdayShort(day: number): string {
  return WD_SHORT[dayDate(day).getDay()]
}

/** Monday-first index (Mon=0..Sun=6) of the 1st of the target month. */
function firstWeekdayMondayIndex(): number {
  const jsDay = new Date(YEAR, MONTH_INDEX, 1).getDay()
  return (jsDay + 6) % 7
}

export function daysInMonth(): number {
  return new Date(YEAR, MONTH_INDEX + 1, 0).getDate()
}

/**
 * Calendar grid cells (Monday-first): null = padding, number = day of month.
 * The grid stops at the target day — Aug 30/31 are past the finish line.
 */
export function buildGrid(): (number | null)[] {
  const pad = firstWeekdayMondayIndex()
  const total = TARGET_DAY
  const cells: (number | null)[] = []
  for (let i = 0; i < pad; i++) cells.push(null)
  for (let d = 1; d <= total; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}
