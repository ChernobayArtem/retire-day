import { useId, type SVGProps } from 'react'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'title'> {
  size?: number | string
  title?: string
}

interface MaterialSymbolProps extends IconProps {
  path: string
  viewBox?: string
}

/**
 * Локальный SVG-рендерер Material Symbols Outlined.
 *
 * Иконки наследуют цвет через `currentColor`, поэтому продуктовый UI продолжает
 * использовать только семантические color-токены и не зависит от CDN или шрифта.
 */
function MaterialSymbol({
  path,
  size = 20,
  title,
  viewBox = '0 -960 960 960',
  role,
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: MaterialSymbolProps) {
  const generatedTitleId = useId()
  const hasAccessibleName = Boolean(title || ariaLabel || ariaLabelledBy)
  const titleId = title && !ariaLabel && !ariaLabelledBy ? generatedTitleId : undefined

  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox={viewBox}
      fill="currentColor"
      focusable="false"
      role={role ?? (hasAccessibleName ? 'img' : undefined)}
      aria-hidden={ariaHidden ?? (!hasAccessibleName || undefined)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy ?? titleId}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path d={path} />
    </svg>
  )
}

/** Material Symbols Outlined: `arrow_back`. */
export function ArrowLeft(props: IconProps) {
  return (
    <MaterialSymbol
      {...props}
      path="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"
    />
  )
}

/** Material Symbols Outlined: `chevron_left`. */
export function ChevronLeft(props: IconProps) {
  return <MaterialSymbol {...props} path="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
}

/** Material Symbols Outlined: `chevron_right`. */
export function ChevronRight(props: IconProps) {
  return <MaterialSymbol {...props} path="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
}

/** Material Symbols Outlined: `close`. */
export function Close(props: IconProps) {
  return (
    <MaterialSymbol
      {...props}
      path="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
    />
  )
}

/** Material Symbols Outlined: `auto_awesome`. */
export function Sparkle(props: IconProps) {
  return (
    <MaterialSymbol
      {...props}
      viewBox="0 0 24 24"
      path="m19 9-1.25-2.75L15 5l2.75-1.25L19 1l1.25 2.75L23 5l-2.75 1.25Zm0 14-1.25-2.75L15 19l2.75-1.25L19 15l1.25 2.75L23 19l-2.75 1.25ZM9 20l-2.5-5.5L1 12l5.5-2.5L9 4l2.5 5.5L17 12l-5.5 2.5Zm0-4.85L10 13l2.15-1L10 11 9 8.85 8 11l-2.15 1L8 13ZM9 12Z"
    />
  )
}

/** Material Symbols Outlined: `grid_view`. */
export function Grid(props: IconProps) {
  return (
    <MaterialSymbol
      {...props}
      path="M120-520v-320h320v320H120Zm0 400v-320h320v320H120Zm400-400v-320h320v320H520Zm0 400v-320h320v320H520ZM200-600h160v-160H200v160Zm400 0h160v-160H600v160Zm0 400h160v-160H600v160Zm-400 0h160v-160H200v160Zm400-400Zm0 240Zm-240 0Zm0-240Z"
    />
  )
}

/** Material Symbols Outlined: `check`. */
export function Check(props: IconProps) {
  return <MaterialSymbol {...props} path="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
}

/** Material Symbols Outlined: `open_in_full`. */
export function Expand(props: IconProps) {
  return (
    <MaterialSymbol
      {...props}
      path="M120-120v-320h80v184l504-504H520v-80h320v320h-80v-184L256-200h184v80H120Z"
    />
  )
}

/** Material Symbols Outlined: `download`. */
export function Download(props: IconProps) {
  return (
    <MaterialSymbol
      {...props}
      path="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"
    />
  )
}

/** Material Symbols Outlined: `featured_seasonal_and_gifts`. */
export function Gift(props: IconProps) {
  return (
    <MaterialSymbol
      {...props}
      path="M160-80v-440H80v-240h208q-5-9-6.5-19t-1.5-21q0-50 35-85t85-35q23 0 43 8.5t37 23.5q17-16 37-24t43-8q50 0 85 35t35 85q0 11-2 20.5t-6 19.5h208v240h-80v440H160Zm400-760q-17 0-28.5 11.5T520-800q0 17 11.5 28.5T560-760q17 0 28.5-11.5T600-800q0-17-11.5-28.5T560-840Zm-200 40q0 17 11.5 28.5T400-760q17 0 28.5-11.5T440-800q0-17-11.5-28.5T400-840q-17 0-28.5 11.5T360-800ZM160-680v80h280v-80H160Zm280 520v-360H240v360h200Zm80 0h200v-360H520v360Zm280-440v-80H520v80h280Z"
    />
  )
}

/** Material Symbols Outlined: `content_copy`. */
export function Copy(props: IconProps) {
  return (
    <MaterialSymbol
      {...props}
      path="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"
    />
  )
}

/** Material Symbols Outlined: `play_arrow`. */
export function Play(props: IconProps) {
  return (
    <MaterialSymbol
      {...props}
      path="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z"
    />
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
  Copy,
  Play,
} as const
