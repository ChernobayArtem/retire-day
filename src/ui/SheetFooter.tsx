import { classNames } from './classNames'
import { Button } from './Button'
import { ChevronLeft, Close } from './Icons'

export interface SheetFooterProps {
  className?: string
  showPrevious?: boolean
  previousDisabled?: boolean
  previousLabel?: string
  closeLabel?: string
  onPrevious?: () => void
  onClose: () => void
}

export function SheetFooter({
  className,
  showPrevious = true,
  previousDisabled = false,
  previousLabel = 'Предыдущий',
  closeLabel = 'Закрыть',
  onPrevious,
  onClose,
}: SheetFooterProps) {
  return (
    <div className={classNames('ui-sheet-footer', className)}>
      {showPrevious && (
        <Button
          variant="outline"
          leadingIcon={<ChevronLeft />}
          fullWidth
          disabled={previousDisabled}
          onClick={onPrevious}
        >
          {previousLabel}
        </Button>
      )}
      <Button variant="outline" leadingIcon={<Close />} fullWidth onClick={onClose}>
        {closeLabel}
      </Button>
    </div>
  )
}
