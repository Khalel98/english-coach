import { describe, it, expect } from 'vitest'
import { gradeHistory, pickNextQuestion, computeSkillLevelIndex, cefrToEnglishLevel, combineFinalCefrLevel, QUESTIONS_PER_SKILL, type GradedAnswer } from './placementTest'
import { PLACEMENT_QUESTIONS } from '../data/placementQuestions'

function graded(overrides: Partial<GradedAnswer>): GradedAnswer {
  return {
    questionId: 'g-b1-1',
    skill: 'grammar',
    topic: 'present_perfect',
    cefrLevel: 'B1',
    correct: true,
    promptText: 'x',
    correctOptionText: 'y',
    selectedOptionText: 'y',
    ...overrides,
  }
}

describe('gradeHistory', () => {
  it('grades correctly against the real answer key, ignoring what the client might claim', () => {
    const [result] = gradeHistory([{ questionId: 'g-a1-1', selectedIndex: 0 }]) // correct answer for "She ___ a teacher." is index 0
    expect(result!.correct).toBe(true)
  })

  it('marks a wrong selection as incorrect', () => {
    const [result] = gradeHistory([{ questionId: 'g-a1-1', selectedIndex: 1 }])
    expect(result!.correct).toBe(false)
  })

  it('silently drops unknown question ids rather than crashing', () => {
    const result = gradeHistory([{ questionId: 'does-not-exist', selectedIndex: 0 }])
    expect(result).toEqual([])
  })
})

describe('pickNextQuestion', () => {
  it('starts at B1 for a skill with no answers yet', () => {
    const q = pickNextQuestion('grammar', [])
    expect(q?.cefrLevel).toBe('B1')
  })

  it('moves up a level after a correct answer', () => {
    const q = pickNextQuestion('grammar', [graded({ cefrLevel: 'B1', correct: true })])
    expect(q?.cefrLevel).toBe('B2')
  })

  it('moves down a level after a wrong answer', () => {
    const q = pickNextQuestion('grammar', [graded({ cefrLevel: 'B1', correct: false })])
    expect(q?.cefrLevel).toBe('A2')
  })

  it('never goes below A1 or above C2', () => {
    const atFloor = pickNextQuestion('grammar', [graded({ cefrLevel: 'A1', correct: false })])
    expect(atFloor?.cefrLevel).toBe('A1')
    const atCeiling = pickNextQuestion('grammar', [graded({ cefrLevel: 'C2', correct: true })])
    expect(atCeiling?.cefrLevel).toBe('C2')
  })

  it('returns null once the skill has reached its question quota', () => {
    const answers = Array.from({ length: QUESTIONS_PER_SKILL }, (_, i) => graded({ questionId: `q${i}` }))
    expect(pickNextQuestion('grammar', answers)).toBeNull()
  })

  it('never repeats a question already asked', () => {
    const q1 = pickNextQuestion('grammar', [])!
    const q2 = pickNextQuestion('grammar', [graded({ questionId: q1.id, cefrLevel: q1.cefrLevel, correct: true })])
    expect(q2?.id).not.toBe(q1.id)
  })

  it('widens the search when a level runs out of unused questions', () => {
    // Exhaust all 3 B1 grammar questions while staying at B1 (alternating correct/wrong keeps bouncing back)
    const b1Grammar = PLACEMENT_QUESTIONS.filter(q => q.skill === 'grammar' && q.cefrLevel === 'B1')
    const history = b1Grammar.map(q => graded({ questionId: q.id, cefrLevel: 'B1', correct: true }))
    const next = pickNextQuestion('grammar', history)
    // Should not return null or throw — must find a nearby level (B2, since all 3 answers were correct)
    expect(next).not.toBeNull()
    expect(next?.cefrLevel).not.toBe('B1')
  })
})

describe('computeSkillLevelIndex', () => {
  it('defaults to B1 (index 2) when the skill was never tested', () => {
    expect(computeSkillLevelIndex([], 'grammar')).toBe(2)
  })

  it('averages the most recent answers, rounded', () => {
    const answers = [
      graded({ questionId: 'a', cefrLevel: 'B1' }),
      graded({ questionId: 'b', cefrLevel: 'B2' }),
      graded({ questionId: 'c', cefrLevel: 'B2' }),
    ]
    // indices: 2, 3, 3 -> avg 2.67 -> rounds to 3 (B2)
    expect(computeSkillLevelIndex(answers, 'grammar')).toBe(3)
  })

  it('only considers the given skill, ignoring the other', () => {
    const answers = [
      graded({ questionId: 'a', skill: 'grammar', cefrLevel: 'A1' }),
      graded({ questionId: 'b', skill: 'vocabulary', cefrLevel: 'C2' }),
    ]
    expect(computeSkillLevelIndex(answers, 'grammar')).toBe(0)
    expect(computeSkillLevelIndex(answers, 'vocabulary')).toBe(5)
  })
})

describe('cefrToEnglishLevel', () => {
  it('maps the 6 CEFR levels onto the 5 app levels, with C1 and C2 both landing on advanced', () => {
    expect(cefrToEnglishLevel('A1')).toBe('beginner')
    expect(cefrToEnglishLevel('B1')).toBe('intermediate')
    expect(cefrToEnglishLevel('C1')).toBe('advanced')
    expect(cefrToEnglishLevel('C2')).toBe('advanced')
  })
})

describe('combineFinalCefrLevel', () => {
  it('averages grammar, vocabulary, and fluency indices', () => {
    expect(combineFinalCefrLevel(2, 2, 2)).toBe('B1')
    expect(combineFinalCefrLevel(5, 5, 5)).toBe('C2')
  })

  it('rounds and clamps to a valid CEFR level', () => {
    expect(combineFinalCefrLevel(0, 0, 1)).toBe('A1') // avg 0.33 -> rounds to 0
    expect(combineFinalCefrLevel(4, 5, 5)).toBe('C2') // avg 4.67 -> rounds to 5
  })
})
