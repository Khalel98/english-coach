import { describe, it, expect } from 'vitest'
import { buildLearnerModel } from './learnerModel'
import { selectSessionFocus } from './sessionFocus'
import type { MistakeRow } from '../db/schema'

function mistake(overrides: Partial<MistakeRow>): MistakeRow {
  return {
    id: 1,
    userId: 'owner',
    mistakeType: 'grammar',
    topic: 'present_perfect',
    incorrectExample: 'x',
    correctExample: 'y',
    explanation: 'z',
    occurrences: 1,
    confidence: 'low',
    firstSeenAt: new Date(),
    lastSeenAt: new Date(),
    ...overrides,
  }
}

describe('buildLearnerModel', () => {
  it('returns an empty model for a brand new user with no mistakes', () => {
    const model = buildLearnerModel([])
    expect(model).toEqual({ grammar: {}, vocabulary: {} })
  })

  it('ignores low-confidence mistakes — a single slip should not shape the model', () => {
    const model = buildLearnerModel([mistake({ confidence: 'low', occurrences: 2 })])
    expect(model.grammar).toEqual({})
  })

  it('maps medium confidence to "developing" and high confidence to "weak"', () => {
    const model = buildLearnerModel([
      mistake({ topic: 'articles', confidence: 'medium', occurrences: 3 }),
      mistake({ topic: 'present_perfect', confidence: 'high', occurrences: 6 }),
    ])

    expect(model.grammar.articles.level).toBe('developing')
    expect(model.grammar.present_perfect.level).toBe('weak')
  })

  it('separates grammar and vocabulary into their own buckets', () => {
    const model = buildLearnerModel([
      mistake({ mistakeType: 'grammar', topic: 'past_simple', confidence: 'high', occurrences: 5 }),
      mistake({ mistakeType: 'vocabulary', topic: 'technology', confidence: 'high', occurrences: 5 }),
    ])

    expect(Object.keys(model.grammar)).toEqual(['past_simple'])
    expect(Object.keys(model.vocabulary)).toEqual(['technology'])
  })
})

describe('selectSessionFocus', () => {
  it('state: brand new user, no data yet -> open conversation, no target', () => {
    const focus = selectSessionFocus({ grammar: {}, vocabulary: {} }, 'normal')

    expect(focus.targetTopic).toBeNull()
    expect(focus.maxHints).toBe(0)
    expect(focus.difficulty).toBe('normal')
  })

  it('state: one developing grammar topic -> targets it with 1 hint, keeps preferred difficulty', () => {
    const model = buildLearnerModel([mistake({ topic: 'articles', confidence: 'medium', occurrences: 3 })])
    const focus = selectSessionFocus(model, 'normal')

    expect(focus.targetType).toBe('grammar')
    expect(focus.targetTopic).toBe('articles')
    expect(focus.skillLevel).toBe('developing')
    expect(focus.maxHints).toBe(1)
    expect(focus.difficulty).toBe('normal')
  })

  it('state: one weak topic and preferred difficulty "hard" -> softens difficulty to "normal", allows 2 hints', () => {
    const model = buildLearnerModel([mistake({ topic: 'present_perfect', confidence: 'high', occurrences: 6 })])
    const focus = selectSessionFocus(model, 'hard')

    expect(focus.skillLevel).toBe('weak')
    expect(focus.difficulty).toBe('normal')
    expect(focus.maxHints).toBe(2)
  })

  it('state: mix of weak and developing topics -> weak wins regardless of occurrence count', () => {
    const model = buildLearnerModel([
      mistake({ topic: 'articles', confidence: 'medium', occurrences: 4 }),
      mistake({ topic: 'present_perfect', confidence: 'high', occurrences: 5 }),
    ])
    const focus = selectSessionFocus(model, 'normal')

    expect(focus.targetTopic).toBe('present_perfect')
    expect(focus.skillLevel).toBe('weak')
  })

  it('state: two weak topics -> the more frequent one wins', () => {
    const model = buildLearnerModel([
      mistake({ topic: 'articles', confidence: 'high', occurrences: 5 }),
      mistake({ topic: 'present_perfect', confidence: 'high', occurrences: 9 }),
    ])
    const focus = selectSessionFocus(model, 'normal')

    expect(focus.targetTopic).toBe('present_perfect')
  })

  it('state: easy-preference user with a weak topic -> difficulty stays easy, not raised', () => {
    const model = buildLearnerModel([mistake({ topic: 'present_perfect', confidence: 'high', occurrences: 5 })])
    const focus = selectSessionFocus(model, 'easy')

    expect(focus.difficulty).toBe('easy')
  })
})
