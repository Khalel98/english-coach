import type { LearnerModel, SkillLevel, LearnerModelCandidate } from './learnerModel'
import { listCandidates } from './learnerModel'
import type { MistakeType } from './memory'
import type { Difficulty } from '../../shared/types'

/**
 * Weak beats developing; within the same level, the most frequent issue is
 * the most worth focusing on. Shared by session focus (free chat) and the
 * grammar drill topic picker, so both agree on what "most worth practicing"
 * means.
 */
export function rankCandidates(candidates: LearnerModelCandidate[]): LearnerModelCandidate[] {
  return [...candidates].sort((a, b) => {
    if (a.level !== b.level) return a.level === 'weak' ? -1 : 1
    return b.occurrences - a.occurrences
  })
}

export interface SessionFocus {
  targetType: MistakeType | null
  targetTopic: string | null
  skillLevel: SkillLevel | null
  difficulty: Difficulty
  maxHints: number
  reason: string
}

/**
 * Principle: DO NOT teach the topic directly — pick a target skill, and let
 * the conversation prompt (prompts.ts) turn it into a natural situation
 * where the learner has to use that construction, without being told that's
 * the point.
 */
export function selectSessionFocus(model: LearnerModel, preferredDifficulty: Difficulty): SessionFocus {
  const candidates = listCandidates(model)

  if (candidates.length === 0) {
    return {
      targetType: null,
      targetTopic: null,
      skillLevel: null,
      difficulty: preferredDifficulty,
      maxHints: 0,
      reason: 'No confirmed weak spots yet — keep the conversation open and natural.',
    }
  }

  const target = rankCandidates(candidates)[0]!

  // A "weak" topic is already hard for the learner — don't also stack the
  // conversation's overall difficulty on top of it, even if their profile
  // prefers "hard". A "developing" topic can keep the profile's difficulty.
  const difficulty: Difficulty = target.level === 'weak' && preferredDifficulty === 'hard'
    ? 'normal'
    : preferredDifficulty

  const maxHints = target.level === 'weak' ? 2 : 1

  return {
    targetType: target.mistakeType,
    targetTopic: target.topic,
    skillLevel: target.level,
    difficulty,
    maxHints,
    reason: `Targeting ${target.mistakeType}/${target.topic} (${target.level}, seen ${target.occurrences} times) to give the learner organic practice.`,
  }
}
