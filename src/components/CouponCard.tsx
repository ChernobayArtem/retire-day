import { useState } from 'react'
import { keepRussianShortWords } from '../lib/typography'
import { trackGoal } from '../lib/analytics'
import { recordJourneyInteraction } from '../lib/journey'
import { CopyAction } from '../ui'

export interface CouponData {
  title?: string
  desc?: string
  /** Та же услуга во втором лице — этот текст Валерия копирует и шлёт Артёму. */
  claim?: string
  emoji?: string
  /** @deprecated черновая структура ранней сборки */ action?: string
  /** @deprecated */ note?: string
}

/** Пара дней ещё на черновой структуре {action, note} — читаем и её, чтобы
 *  карточка не оставалась пустой, пока Артём не перепишет текст. */
export function normaliseCoupon(c: CouponData) {
  return {
    title: c.title ?? c.action ?? '',
    desc: c.desc ?? c.note ?? '',
    claim: c.claim ?? c.action?.toLowerCase() ?? '',
  }
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
export function couponMessage(c: CouponData, emoji: string): string {
  const { title, claim } = normaliseCoupon(c)
  return `Активирую купон 🎟️\n«${title}»\nЗначит: ${claim} ${emoji}`
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
  const { title, desc } = normaliseCoupon(coupon)

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
