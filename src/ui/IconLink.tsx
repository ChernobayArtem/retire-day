import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { classNames } from './classNames'

export interface IconLinkProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'children'
> {
  'aria-label': string
  icon: ReactNode
}

/** Compact inline action: a visible icon only, without control padding. */
export const IconLink = forwardRef<HTMLButtonElement, IconLinkProps>(function IconLink(
  { 'aria-label': ariaLabel, className, disabled, icon, type = 'button', ...props },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      className={classNames('ui-icon-link', className)}
      disabled={disabled}
    >
      <span className="ui-icon-link__icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  )
})
