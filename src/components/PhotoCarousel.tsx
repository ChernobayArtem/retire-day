import { useCallback, useEffect, useRef, useState } from 'react'
import EncImg from './EncImg'

interface Props {
  /** Пути внутри vault, например 'days/10/1.jpg'. */
  photos: string[]
  onExpand: (path: string) => void
}

/**
 * Горизонтальная карусель со scroll-snap: центральная карточка крупнее.
 * Активный элемент считаем по скроллу — CSS scroll-driven анимации ещё не
 * везде поддержаны в iOS Safari.
 */
export default function PhotoCarousel({ photos, onExpand }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const sync = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const mid = track.scrollLeft + track.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    for (let i = 0; i < track.children.length; i++) {
      const el = track.children[i] as HTMLElement
      const dist = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    }
    setActive(best)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    // Стартуем со второй карточки, чтобы центральная сразу была крупной.
    const second = track.children[1] as HTMLElement | undefined
    if (second) {
      track.scrollLeft = second.offsetLeft + second.offsetWidth / 2 - track.clientWidth / 2
    }
    sync()
  }, [sync, photos.length])

  return (
    <div className="carou">
      <button
        className="carou__expand"
        onClick={() => onExpand(photos[active])}
        aria-label="Открыть фото"
      >
        <ExpandIcon />
      </button>
      <div className="carou__track" ref={trackRef} onScroll={sync}>
        {photos.map((p, i) => (
          <button
            key={p}
            className={'carou__item' + (i === active ? ' is-active' : '')}
            onClick={() => onExpand(p)}
          >
            {Math.abs(i - active) <= 1 ? (
              <EncImg className="carou__img" path={p} />
            ) : (
              <span className="carou__img carou__placeholder" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
      <div className="carou__dots" aria-hidden="true">
        {photos.map((p, i) => (
          <span key={p} className={'carou__dot' + (i === active ? ' is-active' : '')} />
        ))}
      </div>
    </div>
  )
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#202020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  )
}
