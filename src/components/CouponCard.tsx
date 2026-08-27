import { useState } from 'react'
import { keepRussianShortWords } from '../lib/typography'
import { trackGoal } from '../lib/analytics'
import { recordJourneyInteraction } from '../lib/journey'
import { CopyAction } from '../ui'

export interface CouponData {
  title: string
  desc: string
  /** Та же услуга во втором лице — этот текст Валерия копирует и шлёт Артёму. */
  claim: string
  emoji?: string
}

interface Props {
  day: number
  analyticsEnabled: boolean
  coupon: CouponData
  /** Эмодзи дня — запасной вариант, если у купона своего нет. */
  fallbackEmoji: string
  onCopy: (text: string) => Promise<boolean> | boolean
}

/** Текст, который ложится в буфер: звучит как сообщение от Валерии, а не как карточка. */
/* eslint-disable-next-line react-refresh/only-export-components --
   The clipboard text belongs next to the card that produces it; splitting it
   into its own module to satisfy Fast Refresh would separate the copy from the
   component it describes for a dev-only convenience. */
export function couponMessage(c: CouponData, emoji: string): string {
  return `Активирую купон 🎟️\n«${c.title}»\nЗначит: ${c.claim} ${emoji}`
}

export default function CouponCard({
  day,
  analyticsEnabled,
  coupon,
  fallbackEmoji,
  onCopy,
}: Props) {
  const [copied, setCopied] = useState(false)
  const emoji = coupon.emoji ?? fallbackEmoji
  const { title, desc } = coupon

  async function handleCopy() {
    const ok = await onCopy(couponMessage(coupon, emoji))
    if (!ok) return
    if (analyticsEnabled) {
      trackGoal('coupon_copy', { day, source: 'sheet' })
      recordJourneyInteraction('coupon', day)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="cpn">
      <div className="cpn__body">
        <h3 className="cpn__title">{keepRussianShortWords(title)}</h3>
        <p className="cpn__desc">{keepRussianShortWords(desc)}</p>
      </div>
      <CopyAction
        className="cpn__copy"
        copied={copied}
        variant="link"
        size="sm"
        onClick={handleCopy}
      />
      <div className="cpn__emoji" aria-hidden="true">
        {emoji}
      </div>
    </div>
  )
}
