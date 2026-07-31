import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { CertCode, DayDef } from '../content/days'
import { dayDate, stateForDay } from '../lib/dates'
import {
  ARCHIVE_CATEGORIES,
  categoryForDay,
  type ArchiveCategory,
} from '../lib/dayCategories'
import { copyText } from '../lib/clipboard'
import { keepRussianShortWords } from '../lib/typography'
import { useVault } from '../lib/vault'
import { couponMessage, normaliseCoupon } from './CouponCard'
import CopyIcon from './CopyIcon'
import { trackGoal, trackView } from '../lib/analytics'

interface Props {
  now: Date
  obscured: boolean
  analyticsEnabled: boolean
  onBack: () => void
  onOpenDay: (day: number) => void
}

const BASE = import.meta.env.BASE_URL

function ddmm(day: number): string {
  const d = dayDate(day)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

function certCodes(def: DayDef): CertCode[] {
  if (!def.cert) return []
  return def.cert.codes ?? (def.cert.code ? [{ value: def.cert.code }] : [])
}

function complimentText(def: DayDef): string {
  return (
    def.compliment ??
    def.compliments?.join(' ') ??
    def.wish ??
    def.message ??
    'Самое важное — внутри этого дня.'
  )
}

function videoAuthor(def: DayDef): string {
  const lines = (def.wish ?? '').split('\n').map((line) => line.trim()).filter(Boolean)
  return lines[1] ?? lines[0] ?? 'Видео-заметка'
}

const CERT_BRANDS: Record<string, string> = {
  'ozon.svg': 'Ozon',
  'wb.svg': 'Wildberries',
  'golden-apple.svg': 'Золотое яблоко',
  'lamoda.svg': 'Lamoda',
}

function certBrand(def: DayDef): string {
  return def.cert?.brand ?? (def.icon ? CERT_BRANDS[def.icon] : undefined) ?? 'Сертификат'
}

export default function SurpriseArchive({
  now,
  obscured,
  analyticsEnabled,
  onBack,
  onOpenDay,
}: Props) {
  const { days } = useVault()
  const rootRef = useRef<HTMLElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const available = useMemo(
    () =>
      (days ?? [])
        .filter((def) => stateForDay(def.day, now) !== 'future')
        .sort((a, b) => b.day - a.day),
    [days, now],
  )
  const initialCategory = available[0] ? categoryForDay(available[0]) : 'compliment'
  const [selected, setSelected] = useState<ArchiveCategory>(initialCategory)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const counts = useMemo(() => {
    const next = Object.fromEntries(
      ARCHIVE_CATEGORIES.map((category) => [category.id, 0]),
    ) as Record<ArchiveCategory, number>
    for (const def of available) next[categoryForDay(def)] += 1
    return next
  }, [available])
  const visibleCategories = useMemo(
    () => ARCHIVE_CATEGORIES.filter((category) => counts[category.id] > 0),
    [counts],
  )

  const selectedItems = available.filter((def) => categoryForDay(def) === selected)

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    rootRef.current?.toggleAttribute('inert', obscured)
  }, [obscured])

  useEffect(() => {
    if (counts[selected] > 0 || visibleCategories.length === 0) return
    setSelected(visibleCategories[0].id)
  }, [counts, selected, visibleCategories])

  useEffect(() => {
    if (!analyticsEnabled || counts[selected] === 0) return
    const label = ARCHIVE_CATEGORIES.find((category) => category.id === selected)?.label ?? 'Архив'
    trackView(`archive-${selected}`, `Архив · ${label}`)
  }, [analyticsEnabled, counts, selected])

  function choose(category: ArchiveCategory) {
    if (analyticsEnabled && category !== selected) {
      trackGoal('archive_category_select', { category })
    }
    setSelected(category)
    bodyRef.current?.scrollTo({ top: 0 })
  }

  async function handleCopy(
    key: string,
    text: string,
    meta: { day: number; kind: 'certificate' | 'coupon'; codeIndex?: number },
  ) {
    if (!(await copyText(text))) return
    if (analyticsEnabled) {
      trackGoal(meta.kind === 'certificate' ? 'certificate_copy' : 'coupon_copy', {
        day: meta.day,
        source: 'archive',
        ...(meta.codeIndex === undefined ? {} : { code_index: meta.codeIndex }),
      })
    }
    setCopiedKey(key)
    window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1800)
  }

  return (
    <section
      ref={rootRef}
      className="archive"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-title"
      aria-hidden={obscured || undefined}
    >
      <header className="archive__header">
        <button className="archive__back" onClick={onBack}>
          <span className="archive__back-arrow" aria-hidden="true">‹</span>
          Назад
        </button>
        <h1 className="archive__title" id="archive-title">Все твои сюрпризы</h1>
        <p className="archive__subtitle">
          {keepRussianShortWords('Здесь собрано всё, что уже открылось в календаре')}
        </p>
      </header>

      {visibleCategories.length > 0 && (
        <div className="archive__tabs" role="group" aria-label="Категории сюрпризов">
          {visibleCategories.map((category) => {
            const active = selected === category.id
            return (
              <button
                key={category.id}
                className={'archive__tab' + (active ? ' is-active' : '')}
                aria-pressed={active}
                onClick={() => choose(category.id)}
              >
                {category.icon && <span aria-hidden="true">{category.icon}</span>}
                <span>{category.label}</span>
                <span className="archive__tab-count">{counts[category.id]}</span>
              </button>
            )
          })}
        </div>
      )}

      <div
        className="archive__body"
        ref={bodyRef}
        role="region"
        aria-label={ARCHIVE_CATEGORIES.find((category) => category.id === selected)?.label}
      >
        {selectedItems.length > 0 ? (
          <div className="archive__list">
            {selectedItems.map((def) => (
              <ArchiveCard
                key={def.day}
                def={def}
                category={selected}
                copiedKey={copiedKey}
                onCopy={handleCopy}
                onOpen={() => onOpenDay(def.day)}
              />
            ))}
          </div>
        ) : (
          <div className="archive__empty">
            <div className="archive__empty-mark" aria-hidden="true">✦</div>
            <h2>Пока здесь пусто</h2>
            <p>
              {keepRussianShortWords('Когда наступит нужный день, сюрприз появится здесь.')}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

interface CardProps {
  def: DayDef
  category: ArchiveCategory
  copiedKey: string | null
  onCopy: (
    key: string,
    text: string,
    meta: { day: number; kind: 'certificate' | 'coupon'; codeIndex?: number },
  ) => void
  onOpen: () => void
}

function ArchiveCard({ def, category, copiedKey, onCopy, onOpen }: CardProps) {
  const style = { '--card-accent': def.accent } as CSSProperties
  const coupon = def.coupon ? normaliseCoupon(def.coupon) : null
  const codes = certCodes(def)

  return (
    <article className={`archive-card archive-card--${category}`} style={style}>
      <div className="archive-card__meta">
        <span>{ddmm(def.day)}</span>
        <span>день {def.day}</span>
      </div>

      {category === 'compliment' && (
        <>
          <h2 className="archive-card__title">{keepRussianShortWords(def.title)}</h2>
          <p className="archive-card__text archive-card__text--clamped">
            {keepRussianShortWords(complimentText(def))}
          </p>
          <ArchiveOpenButton label="Прочитать полностью" onClick={onOpen} />
        </>
      )}

      {category === 'photos' && (
        <>
          <h2 className="archive-card__title">
            {def.collage ? 'Наш коллаж' : `${def.photos?.length ?? 0} фотографий`}
          </h2>
          {(def.wish || def.message) && (
            <p className="archive-card__text">
              {keepRussianShortWords(def.wish ?? def.message ?? '')}
            </p>
          )}
          <ArchiveOpenButton label="Открыть фотографии" onClick={onOpen} />
        </>
      )}

      {category === 'cert' && (
        <>
          <div className="archive-card__cert-head">
            <h2 className="archive-card__title">Сертификат {certBrand(def)}</h2>
            {def.icon && (
              <img
                className="archive-card__brand"
                src={`${BASE}art/${def.icon}`}
                alt={certBrand(def)}
              />
            )}
          </div>
          <div className="archive-card__codes">
            {codes.map((code, index) => {
              const key = `${def.day}-cert-${index}`
              return (
                <div className="archive-card__code-row" key={`${code.value}-${index}`}>
                  <div className="archive-card__code">
                    {code.label && <span className="archive-card__code-label">{code.label} </span>}
                    {code.value}
                  </div>
                  <button
                    className="archive-card__icon-btn"
                    onClick={() =>
                      onCopy(key, code.value, {
                        day: def.day,
                        kind: 'certificate',
                        codeIndex: index,
                      })
                    }
                    aria-label={`Скопировать ${code.label ?? 'код'}`}
                  >
                    {copiedKey === key ? <CheckIcon /> : <CopyIcon />}
                  </button>
                </div>
              )
            })}
          </div>
          <ArchiveOpenButton label="Открыть сертификат" onClick={onOpen} />
        </>
      )}

      {category === 'coupon' && coupon && def.coupon && (
        <>
          <div className="archive-card__coupon-head">
            <h2 className="archive-card__title">
              {keepRussianShortWords(coupon.title)}
            </h2>
            <span className="archive-card__emoji" aria-hidden="true">
              {def.coupon.emoji ?? def.emoji}
            </span>
          </div>
          <p className="archive-card__text">{keepRussianShortWords(coupon.desc)}</p>
          <div className="archive-card__actions">
            <button
              className="archive-card__copy"
              onClick={() =>
                onCopy(
                  `${def.day}-coupon`,
                  couponMessage(def.coupon!, def.coupon!.emoji ?? def.emoji),
                  { day: def.day, kind: 'coupon' },
                )
              }
            >
              {copiedKey === `${def.day}-coupon` ? 'Скопировано' : 'Скопировать'}
              {copiedKey === `${def.day}-coupon` ? <CheckIcon /> : <CopyIcon />}
            </button>
            <button className="archive-card__open archive-card__open--secondary" onClick={onOpen}>
              Открыть день
            </button>
          </div>
        </>
      )}

      {category === 'restaurant' && def.booking && (
        <>
          <h2 className="archive-card__title">
            {keepRussianShortWords(def.booking.when)}
          </h2>
          <p className="archive-card__text">
            {keepRussianShortWords(def.booking.where)}
          </p>
          <ArchiveOpenButton label="Открыть ресторан" onClick={onOpen} />
        </>
      )}

      {category === 'video' && def.video && (
        <>
          <div className="archive-card__video-head">
            <span className="archive-card__play" aria-hidden="true">▶</span>
            <div>
              <h2 className="archive-card__title">
                {keepRussianShortWords(videoAuthor(def))}
              </h2>
              <p className="archive-card__hint">
                {keepRussianShortWords(
                  def.video.src ? 'Видео-заметка готова к просмотру' : 'Видео скоро появится',
                )}
              </p>
            </div>
          </div>
          <ArchiveOpenButton
            label={def.video.src ? 'Посмотреть видео' : 'Открыть день'}
            onClick={onOpen}
          />
        </>
      )}
    </article>
  )
}

function ArchiveOpenButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="archive-card__open" onClick={onClick}>
      {label}
      <span aria-hidden="true">›</span>
    </button>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
