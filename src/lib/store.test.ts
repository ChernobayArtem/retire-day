import { beforeEach, describe, it, expect } from 'vitest'

import { markOpened, resetProgress } from './store'

const KEY = 'retire-day:progress'
const stored = (): { opened: number[] } => JSON.parse(localStorage.getItem(KEY) ?? '{"opened":[]}')

beforeEach(() => {
  localStorage.removeItem(KEY)
  resetProgress()
})

describe('markOpened', () => {
  it('records an opened day and persists it', () => {
    markOpened(5)
    expect(stored().opened).toEqual([5])
  })

  it('keeps the opened list sorted and de-duplicated', () => {
    markOpened(10)
    markOpened(3)
    markOpened(10)
    expect(stored().opened).toEqual([3, 10])
  })
})

describe('resetProgress', () => {
  it('clears every opened day', () => {
    markOpened(7)
    resetProgress()
    expect(stored().opened).toEqual([])
  })
})
