import { forwardRef, type HTMLAttributes } from 'react'
import { classNames } from './classNames'

export type DividerOrientation = 'horizontal' | 'vertical'

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: DividerOrientation
  decorative?: boolean
}

export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider(
  {
    className,
    decorative = true,
    orientation = 'horizontal',
    role,
    ...props
  },
  ref,
) {
  return (
    <hr
      {...props}
      ref={ref}
      className={classNames('ui-divider', `ui-divider--${orientation}`, className)}
      role={decorative ? 'presentation' : role ?? 'separator'}
      aria-hidden={decorative || undefined}
      aria-orientation={decorative ? undefined : orientation}
    />
  )
})
