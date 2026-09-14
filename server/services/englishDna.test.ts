import { describe, it, expect } from 'vitest'
import { buildEnglishDna } from './englishDna'
import type { MistakeRow, MissionLogRow, BossBattleLogRow } from '../db/schema'
import type { UserProfile } from '../../shared/types'

const NOW = new Date('2026-01-15T00:00:00Z')

const profile: UserProfile = {
  estimatedLevel: 'intermediate',
  learningGoal: 'test',
  preferredDifficulty: 'normal',
}

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
    firstSeenAt: NOW,
    lastSeenAt: NOW,
    ...overrides,
  }
}

function bossBattle(overrides: Partial<BossBattleLogRow>): BossBattleLogRow {
  return {
    id: 1,
    userId: 'owner',
    bossBattleId: 'ai-engineer-interview',
    completedAt: NOW,
    verdict: 'defeated',
    dimensions: {
      grammar: 'developing',
      vocabulary: 'strong',
      fluency: 'strong',
      taskCompletion: 'strong',
      technicalEnglish: 'strong',
      abilityToReact: 'strong',
      confidence: 'strong',
    },
    topStrengths: [],
    topWeaknesses: [],
    summary: 'Good job.',
    ...overrides,
  }
}

describe('buildEnglishDna', () => {
  it('state: brand new user with no data at all — everything is insufficient_data, low confidence', () => {
    const dna = buildEnglishDna({ mistakes: [], missionLogs: [], bossBattleLogs: [], profile, now: NOW })

    expect(dna.dataConfidence).toBe('low')
    expect(dna.dimensions.grammar.rating).toBe('insufficient_data')
    expect(dna.dimensions.fluency.rating).toBe('insufficient_data')
    expect(dna.dimensions.listening.rating).toBe('insufficient_data')
    expect(dna.strongestSkills).toEqual([])
    expect(dna.recurringMistakes).toEqual([])
  })

  it('state: only passive mistakes recorded (no Boss Battle) — grammar/vocab derived from mistakes, other dimensions stay insufficient_data', () => {
    const mistakes = [
      mistake({ topic: 'present_perfect', confidence: 'high', occurrences: 5 }),
      mistake({ mistakeType: 'vocabulary', topic: 'phrasal_verbs', confidence: 'medium', occurrences: 3 }),
    ]
    const dna = buildEnglishDna({ mistakes, missionLogs: [], bossBattleLogs: [], profile, now: NOW })

    expect(dna.dimensions.grammar.rating).toBe('weak')
    expect(dna.dimensions.grammar.confidence).toBe('low') // passive data is weaker evidence
    expect(dna.dimensions.vocabulary.rating).toBe('developing')
    expect(dna.dimensions.fluency.rating).toBe('insufficient_data') // nothing assesses this without a Boss Battle
    expect(dna.recurringMistakes[0]!.topic).toBe('present_perfect')
  })

  it('state: a completed Boss Battle overrides passive mistake tallies with graded evidence', () => {
    const mistakes = [mistake({ topic: 'present_perfect', confidence: 'high', occurrences: 5 })]
    const battle = bossBattle({ dimensions: { ...bossBattle({}).dimensions, grammar: 'strong' } })
    const dna = buildEnglishDna({ mistakes, missionLogs: [], bossBattleLogs: [battle], profile, now: NOW })

    expect(dna.dimensions.grammar.rating).toBe('strong')
    expect(dna.dimensions.grammar.confidence).toBe('medium') // only 1 battle so far
    expect(dna.dimensions.fluency.rating).toBe('strong')
    expect(dna.dimensions.technicalEnglish.rating).toBe('strong')
    expect(dna.strongestSkills).toContain('fluency')
  })

  it('state: two Boss Battles — dimension confidence upgrades to high', () => {
    const dna = buildEnglishDna({
      mistakes: [],
      missionLogs: [],
      bossBattleLogs: [bossBattle({ id: 1 }), bossBattle({ id: 2, completedAt: new Date('2026-01-10') })],
      profile,
      now: NOW,
    })

    expect(dna.dimensions.fluency.confidence).toBe('high')
  })

  it('flags a mistake as "stopped making" only if it was a real recurring pattern and has been dormant for over a week', () => {
    const mistakes = [
      mistake({ topic: 'articles', occurrences: 4, confidence: 'medium', lastSeenAt: new Date('2026-01-01T00:00:00Z') }), // 14 days dormant, was real -> stopped
      mistake({ topic: 'prepositions', occurrences: 1, confidence: 'low', lastSeenAt: new Date('2025-12-01T00:00:00Z') }), // dormant but never a real pattern
      mistake({ topic: 'past_simple', occurrences: 5, confidence: 'high', lastSeenAt: NOW }), // still active
    ]
    const dna = buildEnglishDna({ mistakes, missionLogs: [], bossBattleLogs: [], profile, now: NOW })

    const topics = dna.mistakesYouStoppedMaking.map(m => m.topic)
    expect(topics).toContain('articles')
    expect(topics).not.toContain('prepositions')
    expect(topics).not.toContain('past_simple')
  })

  it('builds a 4-week activity trend from real mission completion timestamps', () => {
    const missionLogs: MissionLogRow[] = [
      { id: 1, userId: 'owner', missionId: 'm1', assignedAt: NOW, reflectionText: 'x', completedAt: new Date('2026-01-14T00:00:00Z'), engagement: 'high', evaluationSummary: 'ok' },
      { id: 2, userId: 'owner', missionId: 'm2', assignedAt: NOW, reflectionText: null, completedAt: null, engagement: null, evaluationSummary: null },
    ]
    const dna = buildEnglishDna({ mistakes: [], missionLogs, bossBattleLogs: [], profile, now: NOW })

    expect(dna.activityTrend).toHaveLength(4)
    const totalCompleted = dna.activityTrend.reduce((sum, w) => sum + w.missionsCompleted, 0)
    expect(totalCompleted).toBe(1) // the incomplete mission (completedAt: null) must not be counted
  })
})
