// Types only. The actual content lives encrypted in public/vault and is
// decrypted at runtime (see src/lib/vault.ts) — nothing personal ships in plaintext.
export type DayCategory =
  | 'compliment'
  | 'photos'
  | 'cert'
  | 'coupon'
  | 'restaurant'
  | 'video'

export interface DayMeme {
  photo: string
  /** Без подписи мем встаёт по центру и пузырь не рисуется. */
  caption?: string
  /** Эмодзи-реакция на пузыре, как в iMessage. */
  reaction?: string
}

export interface CertCode {
  /** Подпись перед кодом вместе с разделителем, напр. 'CVC код -'. */
  label?: string
  /** Копируется именно это — без подписи. */
  value: string
}

export interface DayDef {
  day: number
  title: string
  /** Категория — единый источник для календаря, архива и цветового акцента. */
  category: DayCategory
  emoji: string
  icon?: string
  compliment?: string
  collage?: string
  /**
   * Видео-заметка: постер с кнопкой play, тап открывает системный плеер.
   * Пока `src` не добавлен, карточка показывает аккуратную заглушку.
   */
  video?: { src?: string; poster: string }
  /** Дополнительное видео дня, открываемое отдельной компактной кнопкой. */
  bonusVideo?: { src: string }
  /** Бронь: фоновая картинка, прозрачная карточка заведения и детали поверх неё. */
  booking?: { card: string; background?: string; when: string; where: string }
  cert?: {
    brand?: string
    /** Путь внутри vault — баннер прячется вместе с остальным контентом дня. */
    banner?: string
    /** Один или несколько кодов; сертификат без кода не проходит release-аудит. */
    codes: CertCode[]
  }
  /**
   * `title`/`desc` — то, что видно на карточке (от лица Артёма).
   * `claim` — та же услуга во втором лице: этот текст Валерия копирует и
   * отправляет ему, поэтому он звучит как её сообщение, а не как карточка.
   *
   */
  coupon?: {
    title: string
    desc: string
    claim: string
    emoji?: string
  }
  photos?: string[]
  compliments?: string[]
  wish?: string
  meme?: DayMeme
  message?: string
}
