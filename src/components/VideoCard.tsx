import { useState } from 'react'
import { useMedia } from '../lib/useMedia'
import { trackGoal } from '../lib/analytics'
import { recordJourneyInteraction } from '../lib/journey'
import { mediaDownloadName } from '../lib/download'
import VideoLightbox from './VideoLightbox'

interface Props {
  day: number
  analyticsEnabled: boolean
  src?: string
  poster: string
}

/**
 * Постер с кнопкой play; сам ролик расшифровывается только после открытия.
 * Собственный полноэкранный слой оставляет доступными «Скачать» и «Закрыть».
 */
export default function VideoCard({ day, analyticsEnabled, src, poster }: Props) {
  const [opened, setOpened] = useState(false)
  const posterUrl = useMedia(poster)
  const videoUrl = useMedia(opened && src ? src : null)

  function startVideo() {
    if (analyticsEnabled) {
      trackGoal('video_play', { day })
      recordJourneyInteraction('video', day)
    }
    setOpened(true)
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

  return (
    <>
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
      {opened && (
        <VideoLightbox
          src={videoUrl}
          poster={posterUrl}
          sourcePath={src}
          downloadName={mediaDownloadName(`Видео-${day}`, src)}
          onClose={() => setOpened(false)}
        />
      )}
    </>
  )
}

/** Треугольник play в системном стиле iOS. */
function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="40"
      height="40"
      fill="var(--color-semantic-icon-inverse-primary)"
      aria-hidden="true"
    >
      <path d="M8.5 5.6a1 1 0 0 1 1.53-.85l8.2 5.15a1.3 1.3 0 0 1 0 2.2l-8.2 5.15a1 1 0 0 1-1.53-.85V5.6Z" />
    </svg>
  )
}
