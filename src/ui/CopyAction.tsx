import { forwardRef } from 'react'
import { Button, type ButtonProps } from './Button'
import { CopyIcon } from './CopyIcon'
import { Check } from './Icons'

export interface CopyActionProps extends Omit<ButtonProps, 'children' | 'trailingIcon'> {
  copied: boolean
  label?: string
  copiedLabel?: string
}

export const CopyAction = forwardRef<HTMLButtonElement, CopyActionProps>(function CopyAction(
  {
    copied,
    copiedLabel = 'Скопировано',
    label = 'Скопировать',
    variant = 'action',
    ...props
  },
  ref,
) {
  return (
    <Button
      {...props}
      ref={ref}
      variant={variant}
      trailingIcon={copied ? <Check /> : <CopyIcon />}
    >
      {copied ? copiedLabel : label}
    </Button>
  )
})
