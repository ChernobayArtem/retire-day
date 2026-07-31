// День 29 — финал и свобода (кинематографичный тёплый рассвет, Remotion → видео-луп)
import { useEffect, useRef } from 'react'

const BASE = import.meta.env.BASE_URL
const VIDEO = `${BASE}scenes/day29.mp4`
const POSTER = `${BASE}scenes/day29-poster.jpg`

const reduceMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Day29() {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (reduceMotion) return
    const v = ref.current
    if (!v) return
    const tryPlay = () => v.play().catch(() => {})
    tryPlay()
    // Некоторые движки (iOS Low Power Mode и т.п.) стартуют только после жеста.
    window.addEventListener('pointerdown', tryPlay, { once: true, passive: true })
    return () => window.removeEventListener('pointerdown', tryPlay)
  }, [])

  // При включённом «уменьшить движение» — статичный кадр вместо видео.
  if (reduceMotion) {
    return <img className="scn scn-media" src={POSTER} alt="" draggable={false} />
  }
  return (
    <video
      ref={ref}
      className="scn scn-media"
      src={VIDEO}
      poster={POSTER}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
    />
  )
}
