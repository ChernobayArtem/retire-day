import { YEAR, MONTH_INDEX, TARGET_DAY } from '../config'

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

export interface NewChapterPeriod {
  label: string
}

function pluralRu(value: number, one: string, few: string, many: string): string {
  const mod100 = Math.abs(value) % 100
  if (mod100 >= 11 && mod100 <= 14) return many
  const mod10 = mod100 % 10
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

function monthAnniversary(start: Date, offset: number): Date {
  const monthIndex = start.getMonth() + offset
  const year = start.getFullYear() + Math.floor(monthIndex / 12)
  const month = ((monthIndex % 12) + 12) % 12
  const lastDay = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(start.getDate(), lastDay))
}

function completedCalendarMonths(start: Date, now: Date): number {
  let months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth()
  if (months > 0 && now < monthAnniversary(start, months)) months -= 1
  return Math.max(0, months)
}

/**
 * A long-lived, human scale for the epilogue. The UI starts in days, then
 * switches to weeks, calendar months, and finally years + months, so it never
 * ends up shouting something like "1999-й день".
 */
export function newChapterPeriod(now: Date): NewChapterPeriod {
  const start = dayDate(TARGET_DAY + 1)
  const elapsedDays = Math.max(0, diffDays(start, now))

  if (elapsedDays === 0) return { label: 'Новая глава началась сегодня' }
  if (elapsedDays < 7) {
    return {
      label: `Уже ${elapsedDays} ${pluralRu(elapsedDays, 'день', 'дня', 'дней')} новой главы`,
    }
  }

  const months = completedCalendarMonths(start, now)
  if (months === 0) {
    const weeks = Math.max(1, Math.floor(elapsedDays / 7))
    return {
      label: `Уже ${weeks} ${pluralRu(weeks, 'неделя', 'недели', 'недель')} новой главы`,
    }
  }

  if (months < 12) {
    return {
      label: `Уже ${months} ${pluralRu(months, 'месяц', 'месяца', 'месяцев')} новой главы`,
    }
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  const yearsText = `${years} ${pluralRu(years, 'год', 'года', 'лет')}`
  const monthsText = remainingMonths
    ? ` и ${remainingMonths} ${pluralRu(remainingMonths, 'месяц', 'месяца', 'месяцев')}`
    : ''
  return { label: `Уже ${yearsText}${monthsText} новой главы` }
}

export function stateForDay(day: number, now: Date): DayState {
  const rel = diffDays(dayDate(day), now) // now - day
  if (rel > 0) return 'past'
  if (rel === 0) return 'today'
  return 'future'
}

/** Monday-first index (Mon=0..Sun=6) of the 1st of the target month. */
function firstWeekdayMondayIndex(): number {
  const jsDay = new Date(YEAR, MONTH_INDEX, 1).getDay()
  return (jsDay + 6) % 7
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
