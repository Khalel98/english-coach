import { and, eq } from 'drizzle-orm'
import { getDb } from '../db/client'
import { vocabularyWords, vocabularyProgress } from '../db/schema'
import { OWNER_USER_ID } from '../utils/constants'
import { VOCABULARY_WORDS } from '../data/vocabularyWords'
import { selectStudyBatch, type WordWithProgress } from './vocabularySelection'
import { applyReview } from './spacedRepetition'
import { getUserProfile } from '../utils/userProfile'
import type { VocabularyCardView, CefrLevel } from '../../shared/types'

async function ensureWordsSeeded(): Promise<void> {
  const db = getDb()
  const [existing] = await db.select({ id: vocabularyWords.id }).from(vocabularyWords).limit(1)
  if (existing) return
  await db.insert(vocabularyWords).values(VOCABULARY_WORDS).onConflictDoNothing()
}

export async function getStudyBatch(limit = 10): Promise<VocabularyCardView[]> {
  await ensureWordsSeeded()
  const db = getDb()

  const [allWords, progressRows, profile] = await Promise.all([
    db.select().from(vocabularyWords),
    db.select().from(vocabularyProgress).where(eq(vocabularyProgress.userId, OWNER_USER_ID)),
    getUserProfile(),
  ])

  const progressByWordId = new Map(progressRows.map(p => [p.wordId, p]))
  const merged: WordWithProgress[] = allWords.map(w => ({
    id: w.id,
    word: w.word,
    cefrLevel: w.cefrLevel as CefrLevel,
    translationRu: w.translationRu,
    exampleSentence: w.exampleSentence,
    nextReviewAt: progressByWordId.get(w.id)?.nextReviewAt ?? null,
  }))

  const batch = selectStudyBatch(merged, profile.estimatedLevel, new Date(), limit)

  return batch.map(w => ({
    id: w.id,
    word: w.word,
    cefrLevel: w.cefrLevel,
    translationRu: w.translationRu,
    exampleSentence: w.exampleSentence,
  }))
}

export async function submitVocabularyReview(wordId: number, knewIt: boolean): Promise<void> {
  const db = getDb()
  const now = new Date()

  const [existing] = await db
    .select()
    .from(vocabularyProgress)
    .where(and(eq(vocabularyProgress.userId, OWNER_USER_ID), eq(vocabularyProgress.wordId, wordId)))
    .limit(1)

  const { correctStreak, nextReviewAt } = applyReview(existing?.correctStreak ?? 0, knewIt, now)

  if (existing) {
    await db
      .update(vocabularyProgress)
      .set({ correctStreak, nextReviewAt, timesReviewed: existing.timesReviewed + 1, lastReviewedAt: now })
      .where(eq(vocabularyProgress.id, existing.id))
  } else {
    await db.insert(vocabularyProgress).values({
      userId: OWNER_USER_ID,
      wordId,
      correctStreak,
      nextReviewAt,
      timesReviewed: 1,
      lastReviewedAt: now,
    })
  }
}
