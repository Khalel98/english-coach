import { CEFR_LEVELS, PLACEMENT_QUESTIONS, type CefrLevel, type PlacementSkill, type PlacementQuestion } from '../data/placementQuestions'
import type { EnglishLevel } from '../../shared/types'

export const QUESTIONS_PER_SKILL = 6

export interface AnsweredHistoryItem {
  questionId: string
  selectedIndex: number
}

export interface GradedAnswer {
  questionId: string
  skill: PlacementSkill
  topic: string
  cefrLevel: CefrLevel
  correct: boolean
  promptText: string
  correctOptionText: string
  selectedOptionText: string
}

function levelIndex(level: CefrLevel): number {
  return CEFR_LEVELS.indexOf(level)
}

/**
 * The client only ever sends which option index it picked — correctness is
 * always (re)computed here from the question bank, never trusted from the
 * client. This is also what keeps the client "dumb": it never needs to know
 * the answer key.
 */
export function gradeHistory(history: AnsweredHistoryItem[]): GradedAnswer[] {
  return history
    .map((item): GradedAnswer | null => {
      const question = PLACEMENT_QUESTIONS.find(q => q.id === item.questionId)
      if (!question) return null
      return {
        questionId: question.id,
        skill: question.skill,
        topic: question.topic,
        cefrLevel: question.cefrLevel,
        correct: item.selectedIndex === question.correctIndex,
        promptText: question.prompt,
        correctOptionText: question.options[question.correctIndex]!,
        selectedOptionText: question.options[item.selectedIndex] ?? '',
      }
    })
    .filter((g): g is GradedAnswer => g !== null)
}

/**
 * Staircase adaptive selection: start at B1, go up a level on a correct
 * answer, down a level on a wrong one. Simple, transparent, and converges
 * toward the learner's true level within a handful of questions — no need
 * for a full IRT model at this scale (36 questions total).
 */
export function pickNextQuestion(
  skill: PlacementSkill,
  graded: GradedAnswer[],
  bank: PlacementQuestion[] = PLACEMENT_QUESTIONS,
): PlacementQuestion | null {
  const skillAnswers = graded.filter(g => g.skill === skill)
  if (skillAnswers.length >= QUESTIONS_PER_SKILL) return null

  let targetIndex = 2 // start at B1
  const last = skillAnswers[skillAnswers.length - 1]
  if (last) {
    const lastIndex = levelIndex(last.cefrLevel)
    targetIndex = last.correct ? Math.min(5, lastIndex + 1) : Math.max(0, lastIndex - 1)
  }

  const askedIds = new Set(skillAnswers.map(a => a.questionId))
  // Search outward from the target level in case its 3 questions are used up.
  for (let distance = 0; distance <= 5; distance++) {
    for (const idx of distance === 0 ? [targetIndex] : [targetIndex - distance, targetIndex + distance]) {
      if (idx < 0 || idx > 5) continue
      const candidate = bank.find(q => q.skill === skill && q.cefrLevel === CEFR_LEVELS[idx] && !askedIds.has(q.id))
      if (candidate) return candidate
    }
  }
  return null
}

/** Level reached is judged from the most recent answers — early questions calibrate, later ones confirm. */
export function computeSkillLevelIndex(graded: GradedAnswer[], skill: PlacementSkill): number {
  const skillAnswers = graded.filter(g => g.skill === skill)
  if (skillAnswers.length === 0) return 2 // B1 default if the skill wasn't tested at all
  const recent = skillAnswers.slice(-4)
  const avg = recent.reduce((sum, a) => sum + levelIndex(a.cefrLevel), 0) / recent.length
  return Math.round(avg)
}

const ENGLISH_LEVEL_BY_CEFR: Record<CefrLevel, EnglishLevel> = {
  A1: 'beginner',
  A2: 'elementary',
  B1: 'intermediate',
  B2: 'upper_intermediate',
  C1: 'advanced',
  C2: 'advanced',
}

export function cefrToEnglishLevel(cefr: CefrLevel): EnglishLevel {
  return ENGLISH_LEVEL_BY_CEFR[cefr]
}

/** Combines quiz performance with the AI-judged fluency level from the open-dialogue phase into one final CEFR estimate. */
export function combineFinalCefrLevel(grammarIndex: number, vocabularyIndex: number, fluencyIndex: number): CefrLevel {
  const avg = (grammarIndex + vocabularyIndex + fluencyIndex) / 3
  const clamped = Math.max(0, Math.min(5, Math.round(avg)))
  return CEFR_LEVELS[clamped]!
}
