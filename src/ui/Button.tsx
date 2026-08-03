import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { classNames } from './classNames'

export type ButtonVariant = 'primary' | 'outline' | 'soft' | 'action' | 'ghost' | 'link'
export type ButtonSize = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className,
    disabled,
    fullWidth = false,
    leadingIcon,
    loading = false,
    size = 'md',
    trailingIcon,
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
      className={classNames(
        'ui-button',
        `ui-button--${variant}`,
        `ui-button--${size}`,
        fullWidth && 'ui-button--full',
        loading && 'ui-button--loading',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
    >
      <span className="ui-button__content">
        {!loading && leadingIcon ? (
          <span className="ui-button__icon ui-button__icon--leading" aria-hidden="true">
            {leadingIcon}
          </span>
        ) : null}

        <span className="ui-button__label">{children}</span>

        {!loading && trailingIcon ? (
          <span className="ui-button__icon ui-button__icon--trailing" aria-hidden="true">
            {trailingIcon}
          </span>
        ) : null}
      </span>
      {loading ? <span className="ui-button__spinner" aria-hidden="true" /> : null}
    </button>
  )
})
