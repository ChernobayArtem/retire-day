import { createElement, forwardRef, type HTMLAttributes } from 'react'
import { classNames } from './classNames'

export type SurfaceVariant = 'plain' | 'subtle' | 'raised' | 'outlined'
export type SurfaceElement = 'div' | 'section' | 'article'

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: SurfaceElement
  variant?: SurfaceVariant
}

export const Surface = forwardRef<HTMLElement, SurfaceProps>(function Surface(
  { as = 'div', className, variant = 'plain', ...props },
  ref,
) {
  return createElement(as, {
    ...props,
    ref,
    className: classNames('ui-surface', `ui-surface--${variant}`, className),
  })
})
