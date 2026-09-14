import { describe, it, expect } from 'vitest'
import { computeConfidence, normalizeTopic, mergeMistakeOccurrence, formatDigest } from './memory'
import type { MistakeRow } from '../db/schema'

describe('computeConfidence', () => {
  it('treats a single occurrence as low confidence (possibly a random slip)', () => {
    expect(computeConfidence(1)).toBe('low')
    expect(computeConfidence(2)).toBe('low')
  })

  it('treats 3-4 occurrences as medium confidence (likely a real problem)', () => {
    expect(computeConfidence(3)).toBe('medium')
    expect(computeConfidence(4)).toBe('medium')
  })

  it('treats 5+ occurrences as high confidence (persistent problem)', () => {
    expect(computeConfidence(5)).toBe('high')
    expect(computeConfidence(20)).toBe('high')
  })
})

describe('normalizeTopic', () => {
  it('lowercases and slugifies free-text topics so duplicates merge', () => {
    expect(normalizeTopic('Present Perfect')).toBe('present_perfect')
    expect(normalizeTopic('present perfect tense')).toBe('present_perfect_tense')
    expect(normalizeTopic('  Articles  ')).toBe('articles')
  })

  it('collapses punctuation and repeated separators', () => {
    expect(normalizeTopic('word-choice: technology!!')).toBe('word_choice_technology')
  })
})

describe('mergeMistakeOccurrence', () => {
  const detected = {
    mistakeType: 'grammar' as const,
    topic: 'Present Perfect',
    incorrect: 'I work here since 2022',
    correction: 'I have worked here since 2022',
    explanation: 'Use present perfect for actions that started in the past and continue now.',
  }
  const now = new Date('2024-01-05T00:00:00Z')

  it('starts a new mistake at occurrence 1 with low confidence when there is no existing row', () => {
    const merged = mergeMistakeOccurrence(undefined, detected, now)

    expect(merged.occurrences).toBe(1)
    expect(merged.confidence).toBe('low')
    expect(merged.topic).toBe('present_perfect')
    expect(merged.firstSeenAt).toEqual(now)
    expect(merged.lastSeenAt).toEqual(now)
  })

  it('increments occurrences and recomputes confidence when a row already exists', () => {
    const existing: MistakeRow = {
      id: 1,
      userId: 'owner',
      mistakeType: 'grammar',
      topic: 'present_perfect',
      incorrectExample: 'I work here since 2020',
      correctExample: 'I have worked here since 2020',
      explanation: 'previous explanation',
      occurrences: 2,
      confidence: 'low',
      firstSeenAt: new Date('2024-01-01T00:00:00Z'),
      lastSeenAt: new Date('2024-01-02T00:00:00Z'),
    }

    const merged = mergeMistakeOccurrence(existing, detected, now)

    expect(merged.occurrences).toBe(3)
    expect(merged.confidence).toBe('medium')
    expect(merged.firstSeenAt).toEqual(existing.firstSeenAt) // preserved
    expect(merged.lastSeenAt).toEqual(now) // updated
    expect(merged.incorrectExample).toBe(detected.incorrect) // latest example wins
  })

  it('crosses into high confidence at the 5th occurrence', () => {
    const existing: MistakeRow = {
      id: 1,
      userId: 'owner',
      mistakeType: 'grammar',
      topic: 'present_perfect',
      incorrectExample: 'x',
      correctExample: 'y',
      explanation: 'z',
      occurrences: 4,
      confidence: 'medium',
      firstSeenAt: now,
      lastSeenAt: now,
    }

    const merged = mergeMistakeOccurrence(existing, detected, now)

    expect(merged.occurrences).toBe(5)
    expect(merged.confidence).toBe('high')
  })
})

describe('formatDigest', () => {
  it('returns an empty string when there are no rows', () => {
    expect(formatDigest([])).toBe('')
  })

  it('includes topic and example for each row, without instructing the AI to expose counts to the user', () => {
    const rows: MistakeRow[] = [{
      id: 1,
      userId: 'owner',
      mistakeType: 'grammar',
      topic: 'present_perfect',
      incorrectExample: 'I work here since 2022',
      correctExample: 'I have worked here since 2022',
      explanation: 'Use present perfect for ongoing actions.',
      occurrences: 5,
      confidence: 'high',
      firstSeenAt: new Date(),
      lastSeenAt: new Date(),
    }]

    const digest = formatDigest(rows)

    expect(digest).toContain('present_perfect')
    expect(digest).toContain('I work here since 2022')
    expect(digest).toContain('Do not mention the mistake counts')
  })
})
