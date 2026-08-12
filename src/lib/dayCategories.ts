import type { DayDef } from '../content/days'

export type ArchiveCategory =
  | 'compliment'
  | 'photos'
  | 'cert'
  | 'coupon'
  | 'restaurant'
  | 'video'

export interface ArchiveCategoryMeta {
  id: ArchiveCategory
  label: string
  icon?: string
}

export const ARCHIVE_CATEGORIES: ArchiveCategoryMeta[] = [
  { id: 'compliment', label: 'Комплименты', icon: '💌' },
  { id: 'photos', label: 'Фоточки', icon: '📸' },
  // У сертификатов разные бренды, поэтому общей иконки у таба нет.
  { id: 'cert', label: 'Сертификаты' },
  { id: 'coupon', label: 'Купоны', icon: '🎟️' },
  { id: 'restaurant', label: 'Рестораны', icon: '🍽️' },
  { id: 'video', label: 'Видосы', icon: '🎥' },
]

/** Структура надёжнее `type`: видео и ресторан технически имеют type=photo,
 *  а финальный комплимент содержит сертификатную карточку внутри шторки. */
export function categoryForDay(def: DayDef): ArchiveCategory {
  if (
    def.compliment ||
    def.compliments?.length ||
    def.type === 'compliment' ||
    def.type === 'intro'
  ) {
    return 'compliment'
  }
  if (def.video) return 'video'
  if (def.booking) return 'restaurant'
  if (def.coupon) return 'coupon'
  if (def.cert || def.type === 'cert') return 'cert'
  if (def.collage || def.photos?.length || def.type === 'photo') return 'photos'

  // Все текущие 29 дней попадают в ветки выше. Если появится новый простой
  // текстовый формат, он безопаснее всего ведёт себя как комплимент.
  return 'compliment'
}

const CATEGORY_ACCENTS: Record<ArchiveCategory, string> = {
  compliment: 'var(--color-semantic-content-accent-compliment)',
  photos: 'var(--color-semantic-content-accent-photos)',
  cert: 'var(--color-semantic-content-accent-certificate)',
  coupon: 'var(--color-semantic-content-accent-coupon)',
  restaurant: 'var(--color-semantic-content-accent-restaurant)',
  video: 'var(--color-semantic-content-accent-video)',
}

/** Один цвет обозначает тип содержимого, а не порядковый номер дня. Поэтому
 * система одинаково работает для календаря любой длины. */
export function categoryAccent(def: DayDef): string {
  return CATEGORY_ACCENTS[categoryForDay(def)]
}

/** Общие категории в календаре имеют одну узнаваемую иконку. Сертификат
 *  продолжает использовать логотип бренда, а при его отсутствии — emoji дня. */
export function calendarEmoji(def?: DayDef): string {
  if (!def) return '🌸'
  const category = categoryForDay(def)
  return ARCHIVE_CATEGORIES.find((item) => item.id === category)?.icon ?? def.emoji
}
