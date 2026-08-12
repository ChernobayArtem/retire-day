import { useId, type ReactNode, type SVGProps } from 'react'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'title'> {
  size?: number | string
  title?: string
  strokeWidth?: number | string
}

interface IconBaseProps extends IconProps {
  children: ReactNode
}

function IconBase({
  children,
  size = 20,
  strokeWidth = 1.8,
  title,
  role,
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: IconBaseProps) {
  const generatedTitleId = useId()
  const hasAccessibleName = Boolean(title || ariaLabel || ariaLabelledBy)
  const titleId = title && !ariaLabel && !ariaLabelledBy ? generatedTitleId : undefined

  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      role={role ?? (hasAccessibleName ? 'img' : undefined)}
      aria-hidden={ariaHidden ?? (!hasAccessibleName || undefined)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy ?? titleId}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {children}
    </svg>
  )
}

export function ArrowLeft(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </IconBase>
  )
}

export function ChevronLeft(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m15 18-6-6 6-6" />
    </IconBase>
  )
}

export function ChevronRight(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 18 6-6-6-6" />
    </IconBase>
  )
}

export function Close(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </IconBase>
  )
}

export function Sparkle(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3.5c.65 4.16 2.34 5.85 6.5 6.5-4.16.65-5.85 2.34-6.5 6.5-.65-4.16-2.34-5.85-6.5-6.5 4.16-.65 5.85-2.34 6.5-6.5Z" />
      <path d="M19 16.5c.22 1.36.89 2.03 2.25 2.25-1.36.22-2.03.89-2.25 2.25-.22-1.36-.89-2.03-2.25-2.25 1.36-.22 2.03-.89 2.25-2.25Z" />
    </IconBase>
  )
}

export function Grid(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="4" width="6" height="6" rx="1.25" />
      <rect x="14" y="4" width="6" height="6" rx="1.25" />
      <rect x="4" y="14" width="6" height="6" rx="1.25" />
      <rect x="14" y="14" width="6" height="6" rx="1.25" />
    </IconBase>
  )
}

export function Check(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m5 12.5 4.25 4.25L19 7" />
    </IconBase>
  )
}

export function Expand(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="m21 3-7 7" />
      <path d="m3 21 7-7" />
    </IconBase>
  )
}

export function Download(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </IconBase>
  )
}

/** Outline-версия Material Symbols `featured_seasonal_and_gifts`. */
export function Gift(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 10h16v10H4z" />
      <path d="M3 7h18v4H3z" />
      <path d="M12 7v13" />
      <path d="M12 7H8.5a2.5 2.5 0 1 1 2-4c.75.58 1.5 2.2 1.5 4Z" />
      <path d="M12 7h3.5a2.5 2.5 0 1 0-2-4C12.75 3.58 12 5.2 12 7Z" />
    </IconBase>
  )
}

export const Icons = {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Close,
  Sparkle,
  Grid,
  Check,
  Expand,
  Download,
  Gift,
} as const
