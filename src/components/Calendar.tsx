import { buildGrid, stateForDay, type DayState } from '../lib/dates'
import { dayByNumber } from '../lib/vault'
import DayCell from './DayCell'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

interface Props {
  now: Date
  opened: number[]
  testMode?: boolean
  onOpen: (day: number) => void
}

export default function Calendar({ now, opened, testMode = false, onOpen }: Props) {
  const cells = buildGrid()
  return (
    <div className="cal">
      <div className="cal__weekdays">
        {WEEKDAYS.map((w) => (
          <div key={w} className="cal__wd">
            {w}
          </div>
        ))}
      </div>
      <div className="cal__grid">
        {cells.map((d, i) => {
          if (d === null) return <div key={`p${i}`} className="cell cell--empty" />
          const state: DayState = stateForDay(d, now)
          return (
            <DayCell
              key={d}
              day={d}
              state={state}
              opened={opened.includes(d)}
              def={dayByNumber(d)}
              testMode={testMode}
              onOpen={onOpen}
            />
          )
        })}
      </div>
    </div>
  )
}
