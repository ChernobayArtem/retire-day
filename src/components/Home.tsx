import { useEffect, useRef, useState } from 'react'
import type { DayDef } from '../content/days'
import { getNow, daysUntilTarget, stateForDay, diffDays, dayDate } from '../lib/dates'
import { MONTH_TITLE, START_DAY, TOTAL_DAYS } from '../config'
import { useStore, markOpened, resetProgress } from '../lib/store'
import { dayByNumber, logout, mediaUrl } from '../lib/vault'
import { categoryForDay } from '../lib/dayCategories'
import { trackGoal, trackView } from '../lib/analytics'
import Calendar from './Calendar'
import DaySheet from './DaySheet'
import ProgressBar from './ProgressBar'
import SceneStage from './SceneStage'
import SurpriseArchive from './SurpriseArchive'

interface Active {
  day: number
  locked: boolean
}

interface Props {
  testMode: boolean
  dateOverride: string | null
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function shift(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function previewMedia(def: DayDef): string[] {
  return [
    def.meme?.photo,
    def.video?.poster,
    def.collage,
    def.booking?.background,
    def.booking?.card,
    def.cert?.banner,
    ...(def.photos?.slice(0, 2) ?? []),
  ].filter((path): path is string => !!path)
}

export default function Home({ testMode, dateOverride }: Props) {
  const [realNow, setRealNow] = useState<Date>(() => getNow(null))
  // The test account can walk the countdown; the live account always uses today.
  const [simNow, setSimNow] = useState<Date>(() => getNow(dateOverride))
  const now = testMode ? simNow : realNow

  const { opened } = useStore()
  const [active, setActive] = useState<Active | null>(null)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const archiveTriggerRef = useRef<HTMLButtonElement>(null)

  const left = Math.max(0, daysUntilTarget(now))
  // "Day N of 29" — 0 before August, 29 on the finish line.
  const passed = Math.max(0, Math.min(diffDays(dayDate(START_DAY), now) + 1, TOTAL_DAYS))
  const warmDay = Math.max(START_DAY, Math.min(TOTAL_DAYS, passed || START_DAY))

  useEffect(() => {
    if (testMode) return

    let midnightTimer = 0

    function refreshDate() {
      const current = getNow(null)
      setRealNow(current)

      window.clearTimeout(midnightTimer)
      const nextMidnight = new Date(current)
      nextMidnight.setHours(24, 0, 1, 0)
      midnightTimer = window.setTimeout(refreshDate, nextMidnight.getTime() - current.getTime())
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') refreshDate()
    }

    refreshDate()
    window.addEventListener('pageshow', refreshDate)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearTimeout(midnightTimer)
      window.removeEventListener('pageshow', refreshDate)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [testMode])

  useEffect(() => {
    // While the calendar is on screen, quietly prepare the lightweight media
    // for today. The actual video stays tap-to-load.
    const timer = window.setTimeout(() => {
      const def = dayByNumber(warmDay)
      if (!def) return
      for (const path of previewMedia(def)) void mediaUrl(path).catch(() => {})
    }, 350)
    return () => window.clearTimeout(timer)
  }, [warmDay])

  function handleOpen(day: number, source: 'calendar' | 'archive' | 'previous' = 'calendar') {
    const locked = stateForDay(day, now) === 'future' && !testMode
    setActive({ day, locked })
    if (!locked) {
      markOpened(day)
      if (!testMode) {
        const def = dayByNumber(day)
        trackGoal('day_open', {
          day,
          category: def ? categoryForDay(def) : 'unknown',
          source,
        })
        trackView(`day-${day}`, `День ${day}`)
      }
    }
  }

  function openArchive() {
    if (!testMode) trackGoal('archive_open')
    setArchiveOpen(true)
  }

  function closeArchive() {
    setArchiveOpen(false)
    if (!testMode) trackView('calendar', 'Календарь')
    window.requestAnimationFrame(() => archiveTriggerRef.current?.focus({ preventScroll: true }))
  }

  function closeDay() {
    setActive(null)
    if (!testMode) {
      trackView(archiveOpen ? 'archive' : 'calendar', archiveOpen ? 'Архив' : 'Календарь')
    }
  }

  return (
    <div className="home">
      {!archiveOpen && (
        <>
          <ProgressBar passed={passed} />

          <div className="stats">
            <button
              ref={archiveTriggerRef}
              className="stat stat--left stat--archive"
              onClick={openArchive}
              aria-label={
                left > 0
                  ? `${left} дн. осталось — открыть все сюрпризы`
                  : 'Свобода! Открыть все сюрпризы'
              }
            >
              <div className="stat__num">{left}</div>
              <div className="stat__cap">
                {left > 0 ? 'дн. осталось' : 'свобода!'}
                <span className="stat__arrow" aria-hidden="true">›</span>
              </div>
            </button>
            <div className="stat stat--right">
              <div className="stat__num">
                {pad2(now.getDate())}.{pad2(now.getMonth() + 1)}
              </div>
              <div className="stat__cap">сегодня</div>
            </div>
          </div>

          <section className="calbox">
            <h1 className="calbox__title">{MONTH_TITLE}</h1>
            <Calendar
              now={now}
              opened={opened}
              testMode={testMode}
              onOpen={(day) => handleOpen(day, 'calendar')}
            />
          </section>

          <SceneStage day={active?.day ?? (passed || 1)} />

          {testMode && (
            <div className="testbar">
              <button onClick={() => setSimNow((d) => shift(d, -1))} aria-label="День назад">
                ◀
              </button>
              <span className="testbar__date">
                {pad2(now.getDate())}.{pad2(now.getMonth() + 1)}
              </span>
              <button onClick={() => setSimNow((d) => shift(d, 1))} aria-label="День вперёд">
                ▶
              </button>
              <button onClick={() => resetProgress()}>сброс</button>
              <button onClick={() => logout()}>выход</button>
            </div>
          )}
        </>
      )}

      {archiveOpen && (
        <SurpriseArchive
          now={now}
          obscured={!!active}
          analyticsEnabled={!testMode}
          onBack={closeArchive}
          onOpenDay={(day) => handleOpen(day, 'archive')}
        />
      )}

      <DaySheet
        active={active}
        analyticsEnabled={!testMode}
        testMode={testMode}
        onClose={closeDay}
        onNav={(day) => handleOpen(day, 'previous')}
      />
    </div>
  )
}
