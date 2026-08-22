import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { classNames } from './classNames'
import type { ButtonSize, ButtonVariant } from './Button'

export type IconButtonVariant = Exclude<ButtonVariant, 'link'>

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'children'
> {
  'aria-label': string
  icon: ReactNode
  variant?: IconButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    'aria-label': ariaLabel,
    className,
    disabled,
    icon,
    loading = false,
    size = 'md',
    type = 'button',
    variant = 'outline',
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      className={classNames(
        'ui-icon-button',
        `ui-icon-button--${variant}`,
        `ui-icon-button--${size}`,
        loading && 'ui-icon-button--loading',
        className,
      )}
      disabled={disabled || loading}
      data-loading={loading || undefined}
    >
      {loading ? (
        <span className="ui-button__spinner ui-icon-button__spinner" aria-hidden="true" />
      ) : (
        <span className="ui-icon-button__icon" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  )
})
