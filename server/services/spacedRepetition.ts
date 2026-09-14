// Leitner-style intervals: each correct review pushes the next one further
// out; any wrong review resets the streak and brings it back tomorrow.
const INTERVAL_DAYS_BY_STREAK = [1, 3, 7, 14, 30, 90]

export function nextIntervalDays(correctStreakAfterReview: number): number {
  const index = Math.max(0, Math.min(correctStreakAfterReview, INTERVAL_DAYS_BY_STREAK.length - 1))
  return INTERVAL_DAYS_BY_STREAK[index]!
}

export interface ReviewOutcome {
  correctStreak: number
  nextReviewAt: Date
}

export function applyReview(previousStreak: number, knewIt: boolean, now: Date): ReviewOutcome {
  const correctStreak = knewIt ? previousStreak + 1 : 0
  const days = nextIntervalDays(correctStreak)
  const nextReviewAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return { correctStreak, nextReviewAt }
}
