import { useState } from 'react'
import { useMedia } from '../lib/useMedia'
import { trackGoal } from '../lib/analytics'
import { recordJourneyInteraction } from '../lib/journey'

interface Props {
  day: number
  analyticsEnabled: boolean
  src?: string
  poster: string
}

/**
 * Постер с кнопкой play; сам ролик (несколько мегабайт) расшифровывается
 * только по тапу, а не при открытии дня.
 *
 * У <video> намеренно нет `playsinline`: на iPhone такой ролик уходит в
 * системный полноэкранный плеер — привычные controls, свайп-закрытие, AirPlay.
 */
export default function VideoCard({ day, analyticsEnabled, src, poster }: Props) {
  const [started, setStarted] = useState(false)
  const posterUrl = useMedia(poster)
  const videoUrl = useMedia(started && src ? src : null)

  function startVideo() {
    if (analyticsEnabled) {
      trackGoal('video_play', { day })
      recordJourneyInteraction('video', day)
    }
    setStarted(true)
  }

  if (!src) {
    return (
      <div className="vid vid--pending" aria-label="Видео скоро появится">
        {posterUrl ? (
          <img className="vid__poster" src={posterUrl} alt="" />
        ) : (
          <span className="vid__poster encimg-loading" aria-hidden="true" />
        )}
        <span className="vid__pending" aria-hidden="true">
          <span className="vid__pending-icon">🎬</span>
          Видео скоро появится
        </span>
      </div>
    )
  }

  if (!started) {
    return (
      <button className="vid vid--button" onClick={startVideo} aria-label="Смотреть видео">
        {posterUrl ? (
          <img className="vid__poster" src={posterUrl} alt="" />
        ) : (
          <span className="vid__poster encimg-loading" aria-hidden="true" />
        )}
        <span className="vid__play" aria-hidden="true">
          <PlayIcon />
        </span>
      </button>
    )
  }

  return (
    <div className="vid">
      {videoUrl ? (
        <video
          className="vid__player"
          src={videoUrl}
          poster={posterUrl ?? undefined}
          controls
          autoPlay
          preload="auto"
          onCanPlay={(e) => void openPlayer(e.currentTarget)}
        />
      ) : (
        <div className="vid__poster vid__loading">
          {posterUrl && <img className="vid__poster" src={posterUrl} alt="" />}
          <span className="vid__spinner" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}

/**
 * Открыть системный плеер. На iPhone за это отвечает нестандартный
 * `webkitEnterFullscreen` — без него ролик в standalone-PWA может остаться
 * играть внутри карточки, а вертикальное видео там выглядит крошечным.
 */
async function openPlayer(el: HTMLVideoElement) {
  if (el.dataset.opened) return // onCanPlay стреляет не один раз
  el.dataset.opened = '1'
  try {
    await el.play()
  } catch {
    /* автостарт не дали — остаются controls */
  }
  const ios = el as HTMLVideoElement & { webkitEnterFullscreen?: () => void }
  try {
    ios.webkitEnterFullscreen?.()
  } catch {
    /* не в фокусе или уже полноэкранно */
  }
}

/** Треугольник play в системном стиле iOS. */
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="#fff" aria-hidden="true">
      <path d="M8.5 5.6a1 1 0 0 1 1.53-.85l8.2 5.15a1.3 1.3 0 0 1 0 2.2l-8.2 5.15a1 1 0 0 1-1.53-.85V5.6Z" />
    </svg>
  )
}
