import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { DayDef } from '../content/days'
import { dayByNumber } from '../lib/vault'
import { dayDate } from '../lib/dates'
import { useMedia } from '../lib/useMedia'
import { copyText } from '../lib/clipboard'
import { keepRussianShortWords } from '../lib/typography'
import EncImg from './EncImg'
import CouponCard from './CouponCard'
import CertCard from './CertCard'
import PhotoCarousel from './PhotoCarousel'
import VideoCard from './VideoCard'
import BookingCard from './BookingCard'
import Day29Confetti from './Day29Confetti'
import { trackGoal } from '../lib/analytics'

interface Active {
  day: number
  locked: boolean
}
interface Props {
  active: Active | null
  analyticsEnabled: boolean
  testMode: boolean
  onClose: () => void
  onNav: (day: number) => void
}

const BASE = import.meta.env.BASE_URL
const DAY29_CONFETTI_KEY = 'retire-day:day29-confetti:v1'
const asset = (p: string) => `${BASE}${p}`

function ddmm(day: number): string {
  const d = dayDate(day)
  const p = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}`
}

export default function DaySheet({ active, analyticsEnabled, testMode, onClose, onNav }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [showDay29Confetti, setShowDay29Confetti] = useState(false)
  const day29ConfettiChecked = useRef(false)
  const lightboxUrl = useMedia(lightbox)

  useEffect(() => {
    if (active?.day !== 29 || active.locked) {
      setShowDay29Confetti(false)
      return
    }
    if (day29ConfettiChecked.current) return

    day29ConfettiChecked.current = true
    if (!testMode) {
      try {
        if (localStorage.getItem(DAY29_CONFETTI_KEY)) return
        localStorage.setItem(DAY29_CONFETTI_KEY, '1')
      } catch {
        // In private mode the in-memory ref still prevents repeats this session.
      }
    }
    setShowDay29Confetti(true)
  }, [active?.day, active?.locked, testMode])

  useEffect(() => {
    if (!showDay29Confetti) return
    const timer = window.setTimeout(() => setShowDay29Confetti(false), 3400)
    return () => window.clearTimeout(timer)
  }, [showDay29Confetti])

  if (!active) return null
  const def = dayByNumber(active.day)
  const style = def ? ({ '--accent': def.accent } as CSSProperties) : undefined
  const canPrev = active.day > 1
  const locked = active.locked || !def
  const showMeme = !active.locked && !!def?.meme

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div
        className={`sheet sheet--day${active.day}`}
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="day">
          {locked ? (
            <div className="day__top day__top--locked">
              <h2 className="day__title">Попався!</h2>
              <p className="day__wish">
                Рано ещё, киселёчек 😼
                <br />
                Этот день откроется {ddmm(active.day)}
              </p>
            </div>
          ) : (
            <div className="day__top">
              <h2 className="day__title">{keepRussianShortWords(def.title)}</h2>
              <Media
                def={def}
                analyticsEnabled={analyticsEnabled}
                onCopyText={copyText}
                onExpand={setLightbox}
              />
              <hr className="rule" />
              {(def.wish || def.message) && (
                <p className="day__wish">
                  {keepRussianShortWords(def.wish ?? def.message ?? '')}
                </p>
              )}
            </div>
          )}

          <div
            className={
              'day__band' +
              (showMeme || locked ? '' : ' day__band--nomeme') +
              (locked ? ' day__band--locked' : '') +
              // без подписи пузыря нет, и мем встаёт по центру
              (showMeme && !def?.meme?.caption ? ' day__band--center' : '')
            }
          >
            {locked && <img className="day__peek" src={asset('peek.webp')} alt="" />}
            {showMeme && def?.meme && (
              <>
                <EncImg className="meme__photo" path={def.meme.photo} />
                {def.meme.caption && (
                  <div className="meme__bubble">
                    {keepRussianShortWords(def.meme.caption)}
                    {def.meme.reaction && (
                      <span className="meme__reaction" aria-hidden="true">
                        {def.meme.reaction}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
            <div className="day__date">{ddmm(active.day)}</div>
          </div>

          <div className="day__foot">
            <hr className="rule" />
            <div className="day__nav">
              {/* закрытый день листать некуда — остаётся одна кнопка во всю ширину */}
              {!locked && (
                <button
                  className="day__btn day__btn--prev"
                  disabled={!canPrev}
                  onClick={() => canPrev && onNav(active.day - 1)}
                >
                  <span className="day__chev" aria-hidden="true">‹</span>
                  Предыдущий день
                </button>
              )}
              <button className="day__btn day__btn--close" onClick={onClose}>
                <span className="day__x" aria-hidden="true">✕</span>
                Закрыть шторку
              </button>
            </div>
          </div>
        </div>
      </div>

      {lightbox && (
        <div
          className="lightbox"
          onClick={(e) => {
            e.stopPropagation()
            setLightbox(null)
          }}
        >
          {lightboxUrl && <img src={lightboxUrl} alt="" />}
        </div>
      )}

      {showDay29Confetti && <Day29Confetti />}
    </div>
  )
}

interface MediaProps {
  def: DayDef
  analyticsEnabled: boolean
  onCopyText: (text: string) => Promise<boolean>
  onExpand: (src: string) => void
}

function Media({ def, analyticsEnabled, onCopyText, onExpand }: MediaProps) {
  function expand(src: string) {
    if (analyticsEnabled) trackGoal('photo_open', { day: def.day })
    onExpand(src)
  }

  if (def.compliment) {
    return (
      <div className="mcard mcard--compliment">
        {keepRussianShortWords(def.compliment)}
      </div>
    )
  }
  if (def.collage) {
    return (
      <button className="mcard mcard--collage" onClick={() => expand(def.collage!)}>
        <EncImg className="mcard__img" path={def.collage} alt="Наш коллаж" />
        <span className="mcard__expand" aria-hidden="true">
          <ExpandIcon />
        </span>
      </button>
    )
  }
  if (def.video) {
    return (
      <VideoCard
        day={def.day}
        analyticsEnabled={analyticsEnabled}
        src={def.video.src}
        poster={def.video.poster}
      />
    )
  }
  if (def.booking) {
    return (
      <BookingCard
        card={def.booking.card}
        background={def.booking.background}
        when={def.booking.when}
        where={def.booking.where}
      />
    )
  }
  if (def.cert) {
    // `code` — одиночный код ранней версии; новые дни задают `codes`.
    const codes = def.cert.codes ?? (def.cert.code ? [{ value: def.cert.code }] : [])
    if (codes.length > 0) {
      return (
        <CertCard
          day={def.day}
          analyticsEnabled={analyticsEnabled}
          banner={def.cert.banner}
          codes={codes}
          onCopy={onCopyText}
        />
      )
    }
  }
  if (def.coupon) {
    return (
      <CouponCard
        day={def.day}
        analyticsEnabled={analyticsEnabled}
        coupon={def.coupon}
        fallbackEmoji={def.emoji}
        onCopy={onCopyText}
      />
    )
  }
  if (def.cert) {
    return (
      <div className="coupon">
        <div className="coupon__label">🎁 {def.cert.brand ?? 'Сертификат'}</div>
        <div className="coupon__note">Код скоро появится ✨</div>
      </div>
    )
  }
  if (def.photos && def.photos.length > 0) {
    // `photos` — полные пути внутри vault, как и `collage`.
    if (def.photos.length === 1) {
      return (
        <button className="mcard mcard--collage" onClick={() => expand(def.photos![0])}>
          <EncImg className="mcard__img" path={def.photos[0]} />
          <span className="mcard__expand" aria-hidden="true">
            <ExpandIcon />
          </span>
        </button>
      )
    }
    return <PhotoCarousel photos={def.photos} onExpand={expand} />
  }
  if (def.compliments) {
    return (
      <div className="compliments">
        {def.compliments.map((c, i) => (
          <div key={i} className="compliments__item">
            {keepRussianShortWords(c)}
          </div>
        ))}
      </div>
    )
  }
  return <div className="mcard mcard--emoji">{def.emoji}</div>
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#202020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  )
}
