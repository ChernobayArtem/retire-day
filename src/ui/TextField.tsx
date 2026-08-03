import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { classNames } from './classNames'

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  fullWidth?: boolean
  inputClassName?: string
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    className,
    disabled,
    error,
    fullWidth = false,
    hint,
    id,
    inputClassName,
    label,
    leadingIcon,
    trailingIcon,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? `ui-field-${generatedId}`
  const messageId = `${inputId}-message`
  const hasError = Boolean(error)
  const message = hasError ? error : hint
  const describedBy = [ariaDescribedBy, message ? messageId : undefined].filter(Boolean).join(' ') || undefined

  return (
    <div
      className={classNames(
        'ui-text-field',
        hasError && 'ui-text-field--error',
        disabled && 'ui-text-field--disabled',
        fullWidth && 'ui-text-field--full',
        className,
      )}
    >
      {label ? (
        <label className="ui-text-field__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}

      <span className="ui-text-field__control">
        {leadingIcon ? (
          <span className="ui-text-field__icon ui-text-field__icon--leading" aria-hidden="true">
            {leadingIcon}
          </span>
        ) : null}

        <input
          {...props}
          ref={ref}
          id={inputId}
          className={classNames('ui-text-field__input', inputClassName)}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={hasError ? true : ariaInvalid}
        />

        {trailingIcon ? (
          <span className="ui-text-field__icon ui-text-field__icon--trailing" aria-hidden="true">
            {trailingIcon}
          </span>
        ) : null}
      </span>

      {message ? (
        <span
          id={messageId}
          className="ui-text-field__message"
          role={hasError ? 'alert' : undefined}
        >
          {message}
        </span>
      ) : null}
    </div>
  )
})
