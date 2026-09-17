import type { DayDef } from '../content/days'
import { isDayVisiblyOpened, type DayState } from '../lib/dates'
import { calendarEmoji } from '../lib/dayCategories'

interface Props {
  day: number
  state: DayState
  opened: boolean
  def?: DayDef
  onOpen: (day: number) => void
}

export default function DayCell({ day, state, opened, def, onOpen }: Props) {
  const locked = state === 'future'
  const cls = ['cell', `cell--${state}`, isDayVisiblyOpened(opened, state) ? 'cell--opened' : '']
    .filter(Boolean)
    .join(' ')
  const calendarIcon = def?.day === 28 ? 'day-28.png' : def?.cert && def.icon ? def.icon : undefined

  const label = locked
    ? `День ${day}, пока закрыт`
    : opened
      ? `День ${day}, открыт`
      : `День ${day}, открыть`

  return (
    <button className={cls} onClick={() => onOpen(day)} aria-label={label}>
      <span className="cell__num">{day}</span>
      <span className="cell__mark">
        {/* Gift certificates keep the recognizable company logo. Day 28 has
            its own calendar illustration, while remaining a compliment. */}
        {calendarIcon ? (
          <img
            className="cell__icon"
            src={`${import.meta.env.BASE_URL}art/${calendarIcon}`}
            alt=""
          />
        ) : (
          calendarEmoji(def)
        )}
      </span>
    </button>
  )
}
