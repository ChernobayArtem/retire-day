import type { ReactNode } from 'react'
import { classNames } from './classNames'

export interface EmptyStateProps {
  className?: string
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}

export function EmptyState({ className, icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={classNames('ui-empty-state', className)}>
      {icon && <span className="ui-empty-state__icon" aria-hidden="true">{icon}</span>}
      <h2 className="ui-empty-state__title">{title}</h2>
      {description && <p className="ui-empty-state__description">{description}</p>}
      {action && <div className="ui-empty-state__action">{action}</div>}
    </div>
  )
}
