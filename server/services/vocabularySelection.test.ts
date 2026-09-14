import { describe, it, expect } from 'vitest'
import { selectStudyBatch, type WordWithProgress } from './vocabularySelection'

const NOW = new Date('2026-01-15T00:00:00Z')

function word(overrides: Partial<WordWithProgress>): WordWithProgress {
  return {
    id: 1,
    word: 'test',
    cefrLevel: 'B1',
    translationRu: 'тест',
    exampleSentence: 'This is a test.',
    nextReviewAt: null,
    ...overrides,
  }
}

describe('selectStudyBatch', () => {
  it('prioritizes due reviews over new words', () => {
    const words = [
      word({ id: 1, nextReviewAt: new Date('2026-01-10T00:00:00Z') }), // due
      word({ id: 2, nextReviewAt: null, cefrLevel: 'B1' }), // new, matches intermediate level
    ]
    const batch = selectStudyBatch(words, 'intermediate', NOW, 10)
    expect(batch[0]!.id).toBe(1)
  })

  it('excludes words not yet due', () => {
    const words = [word({ id: 1, nextReviewAt: new Date('2026-02-01T00:00:00Z') })] // due in the future
    const batch = selectStudyBatch(words, 'intermediate', NOW, 10)
    expect(batch.find(w => w.id === 1)).toBeUndefined()
  })

  it('orders due reviews by how overdue they are (most overdue first)', () => {
    const words = [
      word({ id: 1, nextReviewAt: new Date('2026-01-14T00:00:00Z') }),
      word({ id: 2, nextReviewAt: new Date('2026-01-01T00:00:00Z') }), // more overdue
    ]
    const batch = selectStudyBatch(words, 'intermediate', NOW, 10)
    expect(batch.map(w => w.id)).toEqual([2, 1])
  })

  it('fills remaining slots with new words near the learner\'s CEFR level', () => {
    const words = [
      word({ id: 1, cefrLevel: 'A1', nextReviewAt: null }), // too easy for an intermediate (B1) learner
      word({ id: 2, cefrLevel: 'B1', nextReviewAt: null }), // matches
      word({ id: 3, cefrLevel: 'B2', nextReviewAt: null }), // one level up, also matches
    ]
    const batch = selectStudyBatch(words, 'intermediate', NOW, 10)
    const ids = batch.map(w => w.id)
    expect(ids).toContain(2)
    expect(ids).toContain(3)
  })

  it('falls back to any new word if not enough words exist near the learner\'s level', () => {
    const words = [word({ id: 1, cefrLevel: 'C2', nextReviewAt: null })]
    const batch = selectStudyBatch(words, 'beginner', NOW, 10)
    expect(batch.map(w => w.id)).toContain(1)
  })

  it('respects the limit', () => {
    const words = Array.from({ length: 20 }, (_, i) => word({ id: i, cefrLevel: 'B1', nextReviewAt: null }))
    const batch = selectStudyBatch(words, 'intermediate', NOW, 5)
    expect(batch).toHaveLength(5)
  })
})
