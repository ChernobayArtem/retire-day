import type { ReactNode } from 'react'
import { classNames } from './classNames'

export interface EmptyStateProps {
  className?: string
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
}

export function EmptyState({ className, icon, title, description }: EmptyStateProps) {
  return (
    <div className={classNames('ui-empty-state', className)}>
      {icon && (
        <span className="ui-empty-state__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <h2 className="ui-empty-state__title">{title}</h2>
      {description && <p className="ui-empty-state__description">{description}</p>}
    </div>
  )
}
