import type { MistakeRow } from '../db/schema'
import type { MistakeType } from './memory'

// No "strong" level here on purpose: we only track mistakes, not successes,
// so there is no evidence yet to justify claiming a skill is strong.
// Claiming confidence without data is exactly what we want to avoid (same
// principle as the future English DNA profile).
export type SkillLevel = 'weak' | 'developing'

export interface SkillEntry {
  level: SkillLevel
  occurrences: number
  lastSeenAt: Date
}

export interface LearnerModel {
  grammar: Record<string, SkillEntry>
  vocabulary: Record<string, SkillEntry>
}

function levelFromConfidence(confidence: MistakeRow['confidence']): SkillLevel | null {
  if (confidence === 'high') return 'weak'
  if (confidence === 'medium') return 'developing'
  return null // 'low' confidence mistakes are too thin to shape the model yet
}

export function buildLearnerModel(rows: MistakeRow[]): LearnerModel {
  const model: LearnerModel = { grammar: {}, vocabulary: {} }

  for (const row of rows) {
    const level = levelFromConfidence(row.confidence)
    if (!level) continue

    const bucket = row.mistakeType === 'vocabulary' ? model.vocabulary : model.grammar
    bucket[row.topic] = { level, occurrences: row.occurrences, lastSeenAt: row.lastSeenAt }
  }

  return model
}

export interface LearnerModelCandidate {
  mistakeType: MistakeType
  topic: string
  level: SkillLevel
  occurrences: number
}

export function listCandidates(model: LearnerModel): LearnerModelCandidate[] {
  const candidates: LearnerModelCandidate[] = []

  for (const [topic, entry] of Object.entries(model.grammar)) {
    candidates.push({ mistakeType: 'grammar', topic, level: entry.level, occurrences: entry.occurrences })
  }
  for (const [topic, entry] of Object.entries(model.vocabulary)) {
    candidates.push({ mistakeType: 'vocabulary', topic, level: entry.level, occurrences: entry.occurrences })
  }

  return candidates
}
