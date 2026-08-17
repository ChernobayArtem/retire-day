import { useState } from 'react'
import type { CertCode } from '../content/days'
import EncImg from './EncImg'
import { trackGoal } from '../lib/analytics'
import { recordJourneyInteraction } from '../lib/journey'
import { CopyIcon, IconLink, Icons } from '../ui'

interface Props {
  day: number
  analyticsEnabled: boolean
  banner?: string
  codes: CertCode[]
  onCopy: (text: string) => Promise<boolean>
}

export default function CertCard({ day, analyticsEnabled, banner, codes, onCopy }: Props) {
  // Один длинный код читается крупно; когда их два, мельче — иначе не влезают.
  const big = codes.length === 1

  return (
    <div className="cert">
      {banner && (
        <div className="cert__banner">
          <EncImg className="cert__bannerimg" path={banner} />
        </div>
      )}
      <div className="cert__codes">
        {codes.map((c, index) => (
          <CodeRow
            key={c.value}
            day={day}
            codeIndex={index}
            analyticsEnabled={analyticsEnabled}
            code={c}
            big={big}
            onCopy={onCopy}
          />
        ))}
      </div>
    </div>
  )
}

function CodeRow({
  day,
  codeIndex,
  analyticsEnabled,
  code,
  big,
  onCopy,
}: {
  day: number
  codeIndex: number
  analyticsEnabled: boolean
  code: CertCode
  big: boolean
  onCopy: Props['onCopy']
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    // Копируем только сам код — подпись вроде «Пин:» в буфере не нужна.
    if (!(await onCopy(code.value))) return
    if (analyticsEnabled) {
      trackGoal('certificate_copy', { day, source: 'sheet', code_index: codeIndex })
      recordJourneyInteraction('certificate', day)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className={'cert__row' + (big ? ' cert__row--big' : '')}>
      <span className="cert__code">
        {code.label && <span className="cert__label">{code.label} </span>}
        {code.value}
      </span>
      <IconLink
        className="cert__copy"
        onClick={handleCopy}
        aria-label={`Скопировать ${code.label ?? 'код'}`}
        icon={
          <>
            {copied ? <Icons.Check /> : <CopyIcon />}
            {copied && <span className="cert__tip">скопировано</span>}
          </>
        }
      />
      <span className="ui-visually-hidden" role="status" aria-live="polite">
        {copied ? 'Код скопирован' : ''}
      </span>
    </div>
  )
}
