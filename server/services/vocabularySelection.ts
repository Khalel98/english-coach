import { CEFR_LEVELS, type CefrLevel } from '../data/placementQuestions'
import type { EnglishLevel } from '../../shared/types'

export interface WordWithProgress {
  id: number
  word: string
  cefrLevel: CefrLevel
  translationRu: string
  exampleSentence: string
  /** null means this word has never been reviewed by the learner — it's "new". */
  nextReviewAt: Date | null
}

const ENGLISH_LEVEL_TO_CEFR_INDEX: Record<EnglishLevel, number> = {
  beginner: 0,
  elementary: 1,
  intermediate: 2,
  upper_intermediate: 3,
  advanced: 4,
}

/**
 * Due reviews always come first (that's the point of spaced repetition).
 * Remaining slots are filled with new words, preferring ones near the
 * learner's current level so cards aren't randomly too easy or too hard.
 */
export function selectStudyBatch(
  words: WordWithProgress[],
  estimatedLevel: EnglishLevel,
  now: Date,
  limit = 10,
): WordWithProgress[] {
  const due = words
    .filter(w => w.nextReviewAt !== null && w.nextReviewAt <= now)
    .sort((a, b) => a.nextReviewAt!.getTime() - b.nextReviewAt!.getTime())
    .slice(0, limit)

  if (due.length >= limit) return due

  const centerIndex = ENGLISH_LEVEL_TO_CEFR_INDEX[estimatedLevel] ?? 2
  const preferredLevels = new Set<CefrLevel>([CEFR_LEVELS[centerIndex], CEFR_LEVELS[centerIndex + 1]].filter((l): l is CefrLevel => Boolean(l)))

  const usedIds = new Set(due.map(w => w.id))
  const preferredNewWords = words.filter(w => w.nextReviewAt === null && !usedIds.has(w.id) && preferredLevels.has(w.cefrLevel))

  const combined = [...due, ...preferredNewWords].slice(0, limit)

  if (combined.length < limit) {
    const combinedIds = new Set(combined.map(w => w.id))
    const anyOtherNewWords = words.filter(w => w.nextReviewAt === null && !combinedIds.has(w.id))
    combined.push(...anyOtherNewWords.slice(0, limit - combined.length))
  }

  return combined
}
