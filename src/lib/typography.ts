const SERVICE_WORDS = [
  'через',
  'между',
  'либо',
  'или',
  'если',
  'чтобы',
  'когда',
  'пока',
  'хотя',
  'зато',
  'так',
  'тоже',
  'также',
  'без',
  'для',
  'над',
  'под',
  'при',
  'про',
  'что',
  'бы',
  'во',
  'да',
  'до',
  'же',
  'за',
  'из',
  'как',
  'ко',
  'ли',
  'на',
  'не',
  'ни',
  'но',
  'об',
  'от',
  'по',
  'со',
  'то',
  'а',
  'в',
  'и',
  'к',
  'о',
  'с',
  'у',
] as const

const WORD_PATTERN = SERVICE_WORDS.join('|')
const BEFORE_LINE_BREAK = new RegExp(
  `(^|\\n)([^\\n]*\\S)[ \\t]+(${WORD_PATTERN})[ \\t]*\\n[ \\t]*(?=\\S)`,
  'giu',
)
const BEFORE_NEXT_WORD = new RegExp(
  `(^|[\\s([{"'«„—–-])(${WORD_PATTERN})[ \\t]+(?=\\S)`,
  'giu',
)

/**
 * Не оставляет русские союзы и предлоги в конце строки.
 * Меняется только отображаемая строка: исходный контент и текст для буфера
 * обмена остаются без неразрывных пробелов.
 */
export function keepRussianShortWords(text: string): string {
  let formatted = text
  let previous = ''

  // Явный перенос мог быть сохранён прямо после служебного слова. Переносим
  // его перед словом; цикл подхватывает цепочки вроде «и не\nсходить».
  while (formatted !== previous) {
    previous = formatted
    formatted = formatted.replace(
      BEFORE_LINE_BREAK,
      (_match, lineStart: string, line: string, word: string) =>
        `${lineStart}${line}\n${word}\u00a0`,
    )
  }

  return formatted.replace(
    BEFORE_NEXT_WORD,
    (_match, prefix: string, word: string) => `${prefix}${word}\u00a0`,
  )
}
