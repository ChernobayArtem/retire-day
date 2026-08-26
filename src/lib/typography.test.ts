import { describe, expect, it } from 'vitest'

import { keepRussianShortWords } from './typography'

/**
 * `keepRussianShortWords` runs over every piece of dynamic Russian prose in the
 * app — AGENTS.md requires it — so a regression here changes how text wraps on
 * every screen at once, silently and everywhere. These tests pin the behaviour
 * that ships today.
 *
 * Fixtures are deliberately bland test phrases: the sensitive audit rejects
 * strings that collide with real day copy.
 */

const NBSP = ' '

describe('keepRussianShortWords', () => {
  it('binds a one-letter preposition to the word after it', () => {
    expect(keepRussianShortWords('тест и проверка')).toBe(`тест и${NBSP}проверка`)
  })

  it('binds longer conjunctions too, not just one-letter ones', () => {
    expect(keepRussianShortWords('чтобы проверить перенос')).toBe(`чтобы${NBSP}проверить перенос`)
    expect(keepRussianShortWords('фикстура для примера')).toBe(`фикстура для${NBSP}примера`)
  })

  it('leaves a service word alone when it only starts a longer word', () => {
    // "как" inside "какой" must not glue: no space follows the prefix.
    expect(keepRussianShortWords('какой длинный текст')).toBe('какой длинный текст')
  })

  it('leaves a trailing service word alone when nothing follows it', () => {
    expect(keepRussianShortWords('слово в конце и')).toBe(`слово в${NBSP}конце и`)
  })

  it('returns prose without service words untouched', () => {
    expect(keepRussianShortWords('простая строка примера')).toBe('простая строка примера')
  })

  it('binds after an opening quote', () => {
    expect(keepRussianShortWords('«в кавычках»')).toBe(`«в${NBSP}кавычках»`)
  })

  it('is idempotent, so re-rendering never doubles the spacing', () => {
    const once = keepRussianShortWords('тест и проверка')
    expect(keepRussianShortWords(once)).toBe(once)
  })

  describe('explicit line breaks', () => {
    it('moves a break that landed right after a service word', () => {
      // The word must travel to the next line with the word it belongs to.
      expect(keepRussianShortWords('первое и\nвторое')).toBe(`первое\nи${NBSP}второе`)
    })

    it('carries a whole chain of service words across the break', () => {
      expect(keepRussianShortWords('цепочка и не\nсходить')).toBe(
        `цепочка\nи${NBSP}не${NBSP}сходить`,
      )
    })
  })

  it('binds consecutive service words alternately, not all of them', () => {
    // Documented rather than desired: after a match consumes its trailing space,
    // the scan resumes past it, so the next service word has no prefix left to
    // match on. Chains split by an explicit break (above) are fully handled.
    // Changing this shifts wrapping on every screen, so it is pinned, not fixed.
    expect(keepRussianShortWords('также и тоже рядом')).toBe(`также${NBSP}и тоже${NBSP}рядом`)
  })
})
