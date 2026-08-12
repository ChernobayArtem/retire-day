import { useState } from 'react'
import { trackGoal } from '../lib/analytics'
import { mediaDownloadName } from '../lib/download'
import { recordJourneyInteraction } from '../lib/journey'
import { useMedia } from '../lib/useMedia'
import { Button, Icons } from '../ui'
import VideoLightbox from './VideoLightbox'

interface Props {
  day: number
  analyticsEnabled: boolean
  src: string
}

/** Compact secondary action for a bonus video attached to a day. */
export default function BonusVideoButton({ day, analyticsEnabled, src }: Props) {
  const [opened, setOpened] = useState(false)
  const videoUrl = useMedia(opened ? src : null)

  function openBonus() {
    if (analyticsEnabled) {
      trackGoal('video_play', { day, bonus: true })
      recordJourneyInteraction('video', day)
    }
    setOpened(true)
  }

  return (
    <>
      <div className="day__bonus">
        <Button
          className="day__bonus-button"
          variant="link"
          size="sm"
          leadingIcon={<Icons.Gift />}
          onClick={openBonus}
          aria-label="Открыть бонусное видео"
        >
          Бонус
        </Button>
      </div>

      {opened && (
        <VideoLightbox
          src={videoUrl}
          poster={null}
          sourcePath={src}
          downloadName={mediaDownloadName(`Бонус-${day}`, src)}
          onClose={() => setOpened(false)}
        />
      )}
    </>
  )
}
