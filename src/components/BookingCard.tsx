import EncImg from './EncImg'

interface Props {
  /** Прозрачная карточка заведения с логотипом и деталями брони. */
  card: string
  /** Отдельный фон карточки, чтобы его можно было менять без перерисовки текста. */
  background?: string
  when: string
  where: string
}

/**
 * Бронь столика. Логотип и текст приходят прозрачным SVG-слоем из Figma,
 * а фон лежит под ним отдельной картинкой. `when`/`where` остаются как
 * текстовое описание для скринридера.
 */
export default function BookingCard({ card, background, when, where }: Props) {
  return (
    <div className="book">
      {background && <EncImg className="book__background" path={background} />}
      <EncImg className="book__card" path={card} alt={`${when}. ${where}`} />
    </div>
  )
}
