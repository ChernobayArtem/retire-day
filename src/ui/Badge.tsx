import { forwardRef, type HTMLAttributes } from 'react'
import { classNames } from './classNames'

export type BadgeVariant = 'neutral' | 'accent'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant = 'neutral', ...props },
  ref,
) {
  return (
    <span
      {...props}
      ref={ref}
      className={classNames('ui-badge', `ui-badge--${variant}`, className)}
    />
  )
})
