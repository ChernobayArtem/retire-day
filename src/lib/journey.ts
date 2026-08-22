import { START_DAY, TOTAL_DAYS } from '../config'

const KEY = 'retire-day:memories-stats:v1'

export type JourneyInteraction = 'video' | 'photo' | 'coupon' | 'certificate'
export type JourneyDaySource = 'calendar' | 'archive' | 'previous' | 'post_finale_random'

interface JourneyState {
  version: 1
  launches: number
  launchDates: string[]
  dayOpens: Record<string, number>
  firstOpenedAt: Record<string, string>
  openedOnTime: number[]
  interactions: Record<JourneyInteraction, Record<string, number>>
  archiveOpens: number
  randomSurprises: number
}

function createInitial(): JourneyState {
  return {
    version: 1,
    launches: 0,
    launchDates: [],
    dayOpens: {},
    firstOpenedAt: {},
    openedOnTime: [],
    interactions: {
      video: {},
      photo: {},
      coupon: {},
      certificate: {},
    },
    archiveOpens: 0,
    randomSurprises: 0,
  }
}

let appOpenRecorded = false
let lastRecordedDate: string | null = null

function localDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function numberMap(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object') return {}
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, number] => {
      return typeof entry[1] === 'number' && Number.isFinite(entry[1]) && entry[1] >= 0
    }),
  )
}

function read(): JourneyState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return createInitial()
    const parsed = JSON.parse(raw) as Partial<JourneyState>
    return {
      ...createInitial(),
      launches: typeof parsed.launches === 'number' ? Math.max(0, parsed.launches) : 0,
      launchDates: Array.isArray(parsed.launchDates)
        ? parsed.launchDates.filter((date): date is string => typeof date === 'string')
        : [],
      dayOpens: numberMap(parsed.dayOpens),
      firstOpenedAt:
        parsed.firstOpenedAt && typeof parsed.firstOpenedAt === 'object'
          ? Object.fromEntries(
              Object.entries(parsed.firstOpenedAt).filter(
                (entry): entry is [string, string] => typeof entry[1] === 'string',
              ),
            )
          : {},
      openedOnTime: Array.isArray(parsed.openedOnTime)
        ? parsed.openedOnTime.filter((day): day is number => Number.isInteger(day))
        : [],
      interactions: {
        video: numberMap(parsed.interactions?.video),
        photo: numberMap(parsed.interactions?.photo),
        coupon: numberMap(parsed.interactions?.coupon),
        certificate: numberMap(parsed.interactions?.certificate),
      },
      archiveOpens: typeof parsed.archiveOpens === 'number' ? Math.max(0, parsed.archiveOpens) : 0,
      randomSurprises:
        typeof parsed.randomSurprises === 'number' ? Math.max(0, parsed.randomSurprises) : 0,
    }
  } catch {
    return createInitial()
  }
}

function update(mutator: (current: JourneyState) => JourneyState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(mutator(read())))
  } catch {
    // The recap is a bonus: the app must keep working if storage is unavailable.
  }
}

/** One launch per page load, plus a live-PWA return on a new date. */
export function recordJourneyAppOpen(now: Date): void {
  const date = localDateKey(now)
  if (appOpenRecorded && lastRecordedDate === date) return
  appOpenRecorded = true
  lastRecordedDate = date
  update((current) => ({
    ...current,
    launches: current.launches + 1,
    launchDates: current.launchDates.includes(date)
      ? current.launchDates
      : [...current.launchDates, date].sort(),
  }))
}

/** Preserve the days opened before local recap tracking was introduced. */
export function seedJourneyOpenedDays(days: number[]): void {
  update((current) => {
    const dayOpens = { ...current.dayOpens }
    let changed = false

    for (const day of days) {
      if (!Number.isInteger(day) || day < START_DAY || day > TOTAL_DAYS || dayOpens[String(day)]) {
        continue
      }
      dayOpens[String(day)] = 1
      changed = true
    }

    return changed ? { ...current, dayOpens } : current
  })
}

export function recordJourneyDayOpen(day: number, onTime: boolean, source: JourneyDaySource): void {
  const key = String(day)
  update((current) => ({
    ...current,
    dayOpens: { ...current.dayOpens, [key]: (current.dayOpens[key] ?? 0) + 1 },
    firstOpenedAt: current.firstOpenedAt[key]
      ? current.firstOpenedAt
      : { ...current.firstOpenedAt, [key]: new Date().toISOString() },
    openedOnTime:
      onTime && !current.openedOnTime.includes(day)
        ? [...current.openedOnTime, day].sort((a, b) => a - b)
        : current.openedOnTime,
    randomSurprises:
      source === 'post_finale_random' ? current.randomSurprises + 1 : current.randomSurprises,
  }))
}

export function recordJourneyInteraction(kind: JourneyInteraction, day: number): void {
  const key = String(day)
  update((current) => ({
    ...current,
    interactions: {
      ...current.interactions,
      [kind]: {
        ...current.interactions[kind],
        [key]: (current.interactions[kind][key] ?? 0) + 1,
      },
    },
  }))
}

export function recordJourneyArchiveOpen(): void {
  update((current) => ({ ...current, archiveOpens: current.archiveOpens + 1 }))
}
