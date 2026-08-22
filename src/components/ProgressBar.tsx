import { useLayoutEffect, useRef, useState } from 'react'
import { TOTAL_DAYS } from '../config'
import Orchid from './Orchid'

interface Props {
  /** How many of the 29 days are already behind (0..29). */
  passed: number
}

export default function ProgressBar({ passed }: Props) {
  const done = Math.max(0, Math.min(passed, TOTAL_DAYS))
  const pct = Math.round((done / TOTAL_DAYS) * 100)
  // Past ~55% the caption would run off the right edge, so mirror it.
  const flip = pct > 55

  const rowRef = useRef<HTMLDivElement>(null)
  const [markX, setMarkX] = useState<number | null>(null)

  // The elbow points at a flower, so it has to sit on that flower's real centre.
  // `left: ${pct}%` measures against the whole row — which also carries the
  // 🚀/🏁 caps and 30 gaps — so the flowers' own 0..100 range is offset from it
  // and the pointer drifts right, up to 1.5 flowers by the end of the month.
  useLayoutEffect(() => {
    const row = rowRef.current
    if (!row) return

    const measure = () => {
      // children: [🚀, orchid ×29, 🏁] — the last lit flower is children[done].
      const flower = row.children[Math.max(done, 1)] as HTMLElement | undefined
      if (!flower) return
      const rowBox = row.getBoundingClientRect()
      const box = flower.getBoundingClientRect()
      // .pb__labels shares its left edge with .pb__row, so this is usable as-is.
      setMarkX(box.left + box.width / 2 - rowBox.left)
    }

    measure()
    // Flowers flex, so both the row resizing and the emoji caps settling to
    // their final width change where the centres land.
    const ro = new ResizeObserver(measure)
    ro.observe(row)
    if (row.children[1]) ro.observe(row.children[1])
    return () => ro.disconnect()
  }, [done])

  return (
    <div className="pb">
      <div className="pb__labels">
        <div
          className={'pb__label' + (flip ? ' pb__label--flip' : '')}
          style={{ left: markX === null ? `${pct}%` : `${markX}px` }}
        >
          <span className="pb__elbow" aria-hidden="true" />
          <span className="pb__pct">пройдено {pct}%</span>
        </div>
      </div>

      <div
        className="pb__row"
        ref={rowRef}
        role="img"
        aria-label={`Пройдено ${done} из ${TOTAL_DAYS} дней`}
      >
        <span className="pb__cap" aria-hidden="true">
          🚀
        </span>
        {Array.from({ length: TOTAL_DAYS }, (_, i) => (
          <Orchid key={i} className={'pb__orchid' + (i < done ? ' pb__orchid--on' : '')} />
        ))}
        <span className="pb__cap" aria-hidden="true">
          🏁
        </span>
      </div>
    </div>
  )
}
