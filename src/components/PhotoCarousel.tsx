import { useCallback, useEffect, useRef, useState } from 'react'
import EncImg from './EncImg'
import { IconButton, Icons } from '../ui'

interface Props {
  /** Пути внутри vault, например 'days/10/1.jpg'. */
  photos: string[]
  onExpand: (path: string, index: number) => void
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
      <IconButton
        className="carou__expand"
        variant="ghost"
        size="sm"
        onClick={() => onExpand(photos[active], active)}
        aria-label="Открыть фото"
        icon={<Icons.Expand size={16} />}
      />
      <div className="carou__track" ref={trackRef} onScroll={sync}>
        {photos.map((p, i) => (
          <button
            key={p}
            className={'carou__item' + (i === active ? ' is-active' : '')}
            onClick={() => onExpand(p, i)}
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
