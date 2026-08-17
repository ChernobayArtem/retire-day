import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { classNames } from './classNames'

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, onKeyDown, role = 'tablist', ...props },
  ref,
) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return

    const currentTab = (event.target as HTMLElement).closest<HTMLButtonElement>('[role="tab"]')
    if (!currentTab || !event.currentTarget.contains(currentTab)) return

    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
    )
    const currentIndex = tabs.indexOf(currentTab)
    if (currentIndex < 0 || tabs.length < 2) return

    let nextIndex: number | undefined
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabs.length - 1
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length
    }
    if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
    }

    if (nextIndex === undefined) return
    event.preventDefault()
    tabs[nextIndex]?.focus()
    tabs[nextIndex]?.click()
  }

  return (
    <div
      {...props}
      ref={ref}
      role={role}
      aria-orientation="horizontal"
      className={classNames('ui-tabs', className)}
      onKeyDown={handleKeyDown}
    />
  )
})

export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean
  icon?: ReactNode
  badge?: ReactNode
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  {
    badge,
    children,
    className,
    disabled,
    icon,
    selected,
    tabIndex,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      role="tab"
      aria-selected={selected}
      tabIndex={tabIndex ?? (selected && !disabled ? 0 : -1)}
      disabled={disabled}
      className={classNames(
        'ui-tab',
        selected && 'ui-tab--active',
        selected && 'is-active',
        className,
      )}
    >
      {icon ? (
        <span className="ui-tab__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="ui-tab__label">{children}</span>
      {badge ? <span className="ui-tab__badge">{badge}</span> : null}
    </button>
  )
})
