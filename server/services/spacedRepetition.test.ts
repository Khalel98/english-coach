import { describe, it, expect } from 'vitest'
import { nextIntervalDays, applyReview } from './spacedRepetition'

describe('nextIntervalDays', () => {
  it('starts at 1 day for a fresh streak', () => {
    expect(nextIntervalDays(0)).toBe(1)
  })

  it('grows with the streak', () => {
    expect(nextIntervalDays(1)).toBe(3)
    expect(nextIntervalDays(2)).toBe(7)
    expect(nextIntervalDays(3)).toBe(14)
    expect(nextIntervalDays(4)).toBe(30)
  })

  it('caps at 90 days for long streaks instead of growing forever', () => {
    expect(nextIntervalDays(5)).toBe(90)
    expect(nextIntervalDays(100)).toBe(90)
  })
})

describe('applyReview', () => {
  const now = new Date('2026-01-01T00:00:00Z')

  it('increments the streak and schedules further out on a correct review', () => {
    const outcome = applyReview(2, true, now)
    expect(outcome.correctStreak).toBe(3)
    expect(outcome.nextReviewAt.toISOString()).toBe('2026-01-15T00:00:00.000Z') // +14 days
  })

  it('resets the streak and schedules for tomorrow on a wrong review, no matter how long the prior streak was', () => {
    const outcome = applyReview(5, false, now)
    expect(outcome.correctStreak).toBe(0)
    expect(outcome.nextReviewAt.toISOString()).toBe('2026-01-02T00:00:00.000Z') // +1 day
  })
})
