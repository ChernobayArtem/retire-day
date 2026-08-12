import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { CertCode, DayDef } from '../content/days'
import { dayDate, stateForDay } from '../lib/dates'
import {
  ARCHIVE_CATEGORIES,
  categoryAccent,
  categoryForDay,
  type ArchiveCategory,
} from '../lib/dayCategories'
import { copyText } from '../lib/clipboard'
import { keepRussianShortWords } from '../lib/typography'
import { useVault } from '../lib/vault'
import { couponMessage, normaliseCoupon } from './CouponCard'
import { trackGoal, trackView } from '../lib/analytics'
import { recordJourneyInteraction } from '../lib/journey'
import {
  Badge,
  Button,
  CopyAction,
  CopyIcon,
  EmptyState,
  IconButton,
  Icons,
  Surface,
  Tab,
  TabsList,
} from '../ui'

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
      recordJourneyInteraction(meta.kind === 'certificate' ? 'certificate' : 'coupon', meta.day)
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
        <Button
          className="archive__back"
          variant="link"
          size="sm"
          leadingIcon={<Icons.ArrowLeft />}
          onClick={onBack}
        >
          Назад
        </Button>
        <h1 className="archive__title" id="archive-title">Все твои сюрпризы</h1>
        <p className="archive__subtitle">
          {keepRussianShortWords('Здесь собрано всё, что уже открылось в календаре')}
        </p>
      </header>

      {visibleCategories.length > 0 && (
        <TabsList className="archive__tabs" aria-label="Категории сюрпризов">
          {visibleCategories.map((category) => {
            const active = selected === category.id
            return (
              <Tab
                key={category.id}
                id={`archive-tab-${category.id}`}
                className="archive__tab"
                selected={active}
                aria-controls="archive-panel"
                icon={category.icon ? <span>{category.icon}</span> : undefined}
                badge={
                  <Badge variant={active ? 'accent' : 'neutral'}>
                    {counts[category.id]}
                  </Badge>
                }
                onClick={() => choose(category.id)}
              >
                {category.label}
              </Tab>
            )
          })}
        </TabsList>
      )}

      <div
        id="archive-panel"
        className="archive__body"
        ref={bodyRef}
        role={visibleCategories.length > 0 ? 'tabpanel' : 'region'}
        aria-labelledby={visibleCategories.length > 0 ? `archive-tab-${selected}` : undefined}
        aria-label={
          visibleCategories.length > 0
            ? ARCHIVE_CATEGORIES.find((category) => category.id === selected)?.label
            : 'Открытые сюрпризы'
        }
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
          <EmptyState
            className="archive__empty"
            icon={<Icons.Sparkle />}
            title="Пока здесь пусто"
            description={keepRussianShortWords(
              'Когда наступит нужный день, сюрприз появится здесь.',
            )}
          />
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
  const style = { '--card-accent': categoryAccent(def) } as CSSProperties
  const coupon = def.coupon ? normaliseCoupon(def.coupon) : null
  const codes = certCodes(def)

  return (
    <Surface
      as="article"
      variant="raised"
      className={`archive-card archive-card--${category}`}
      style={style}
    >
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
                  <IconButton
                    className="archive-card__icon-action"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      onCopy(key, code.value, {
                        day: def.day,
                        kind: 'certificate',
                        codeIndex: index,
                      })
                    }
                    aria-label={`Скопировать ${code.label ?? 'код'}`}
                    icon={copiedKey === key ? <Icons.Check /> : <CopyIcon />}
                  />
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
            <CopyAction
              className="archive-card__copy"
              copied={copiedKey === `${def.day}-coupon`}
              variant="action"
              fullWidth
              onClick={() =>
                onCopy(
                  `${def.day}-coupon`,
                  couponMessage(def.coupon!, def.coupon!.emoji ?? def.emoji),
                  { day: def.day, kind: 'coupon' },
                )
              }
            />
            <Button
              className="archive-card__open archive-card__open--inline"
              variant="outline"
              fullWidth
              onClick={onOpen}
            >
              Открыть день
            </Button>
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
    </Surface>
  )
}

function ArchiveOpenButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      className="archive-card__open"
      variant="outline"
      trailingIcon={<Icons.ChevronRight />}
      fullWidth
      onClick={onClick}
    >
      {label}
    </Button>
  )
}
