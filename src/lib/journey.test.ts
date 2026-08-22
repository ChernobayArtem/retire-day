import { beforeEach, describe, it, expect } from 'vitest'

import { seedJourneyOpenedDays } from './journey'

const KEY = 'retire-day:memories-stats:v1'
const stats = (): { dayOpens: Record<string, number> } =>
  JSON.parse(localStorage.getItem(KEY) ?? '{"dayOpens":{}}')

beforeEach(() => {
  localStorage.removeItem(KEY)
})

describe('seedJourneyOpenedDays', () => {
  it('seeds valid in-range days as opened once', () => {
    seedJourneyOpenedDays([1, 15, 29])
    expect(stats().dayOpens).toEqual({ '1': 1, '15': 1, '29': 1 })
  })

  it('ignores out-of-range, non-integer and duplicate days', () => {
    seedJourneyOpenedDays([0, 30, 2.5, 10, 10])
    expect(stats().dayOpens).toEqual({ '10': 1 })
  })
})
